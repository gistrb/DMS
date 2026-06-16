using DMS.Backend.Models;

namespace DMS.Backend.Data;

public static class DbInitializer
{
    public static void Seed(AppDbContext db)
    {
        var permissions = new List<Permission>
        {
            new() { Id = 1, Name = "documents.view", Description = "View documents" },
            new() { Id = 2, Name = "documents.create", Description = "Create/upload documents" },
            new() { Id = 3, Name = "documents.edit", Description = "Edit documents" },
            new() { Id = 4, Name = "documents.delete", Description = "Delete documents" },
            new() { Id = 5, Name = "documents.download", Description = "Download documents" },
            new() { Id = 6, Name = "users.view", Description = "View users" },
            new() { Id = 7, Name = "users.create", Description = "Create users" },
            new() { Id = 8, Name = "users.edit", Description = "Edit users" },
            new() { Id = 9, Name = "users.delete", Description = "Delete users" },
            new() { Id = 10, Name = "roles.manage", Description = "Manage roles & permissions" },
        };
        db.Permissions.AddRange(permissions);

        var roles = new List<Role>
        {
            new() { Id = 1, Name = "Admin", Description = "Full system access" },
            new() { Id = 2, Name = "Manager", Description = "Manage documents and users" },
            new() { Id = 3, Name = "Editor", Description = "Create and edit documents" },
            new() { Id = 4, Name = "Viewer", Description = "View and download documents" },
        };
        db.Roles.AddRange(roles);

        var rolePerms = new List<RolePermission>
        {
            new() { RoleId = 1, PermissionId = 1 }, new() { RoleId = 1, PermissionId = 2 },
            new() { RoleId = 1, PermissionId = 3 }, new() { RoleId = 1, PermissionId = 4 },
            new() { RoleId = 1, PermissionId = 5 }, new() { RoleId = 1, PermissionId = 6 },
            new() { RoleId = 1, PermissionId = 7 }, new() { RoleId = 1, PermissionId = 8 },
            new() { RoleId = 1, PermissionId = 9 }, new() { RoleId = 1, PermissionId = 10 },
            new() { RoleId = 2, PermissionId = 1 }, new() { RoleId = 2, PermissionId = 2 },
            new() { RoleId = 2, PermissionId = 3 }, new() { RoleId = 2, PermissionId = 4 },
            new() { RoleId = 2, PermissionId = 5 }, new() { RoleId = 2, PermissionId = 6 },
            new() { RoleId = 2, PermissionId = 7 }, new() { RoleId = 2, PermissionId = 8 },
            new() { RoleId = 3, PermissionId = 1 }, new() { RoleId = 3, PermissionId = 2 },
            new() { RoleId = 3, PermissionId = 3 }, new() { RoleId = 3, PermissionId = 5 },
            new() { RoleId = 4, PermissionId = 1 }, new() { RoleId = 4, PermissionId = 5 },
        };
        db.RolePermissions.AddRange(rolePerms);

        var categories = new List<Category>
        {
            new() { Id = 1, Name = "General", Description = "General documents" },
            new() { Id = 2, Name = "HR", Description = "Human resources documents" },
            new() { Id = 3, Name = "Finance", Description = "Financial documents" },
            new() { Id = 4, Name = "Technical", Description = "Technical documentation" },
            new() { Id = 5, Name = "Legal", Description = "Legal documents" },
        };
        db.Categories.AddRange(categories);

        db.SaveChanges();
    }

    public static void EnsureAdmin(AppDbContext db)
    {
        if (!db.Users.Any(u => u.Username == "admin"))
        {
            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@dms.local",
                FullName = "System Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                RoleId = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };
            db.Users.Add(adminUser);
            db.SaveChanges();
        }
    }
}
