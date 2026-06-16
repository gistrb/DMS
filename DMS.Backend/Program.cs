using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DMS.Backend.Data;
using DMS.Backend.Middleware;
using DMS.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://+:{port}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var rawConnectionString = builder.Configuration["DATABASE_URL"]
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=dmsdb;Username=dms;Password=dms_pass";
var connectionString = ParseConnectionString(rawConnectionString);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

static string ParseConnectionString(string input)
{
    if (!input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) &&
        !input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        return input;

    var uri = new Uri(input);
    var host = uri.Host;
    var port = uri.IsDefaultPort ? "5432" : uri.Port.ToString();
    var db = uri.AbsolutePath.TrimStart('/').Split('?')[0];
    var user = uri.UserInfo.Split(':').ElementAtOrDefault(0) ?? "";
    var pass = uri.UserInfo.Split(':').ElementAtOrDefault(1) ?? "";
    return $"Host={host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Prefer;Trust Server Certificate=true";
}

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
        };
    });

builder.Services.AddAuthorization(options =>
{
    var permissions = new[] { "documents.view", "documents.create", "documents.edit", "documents.delete", "documents.download" };
    foreach (var perm in permissions)
    {
        var policyName = $"RequirePermission.{perm}";
        options.AddPolicy(policyName, policy =>
            policy.RequireClaim("permission", perm));
    }
});

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
