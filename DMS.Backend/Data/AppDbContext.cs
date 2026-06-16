using Microsoft.EntityFrameworkCore;
using DMS.Backend.Models;

namespace DMS.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentVersion> DocumentVersions => Set<DocumentVersion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.Role).WithMany(r => r.Users).HasForeignKey(u => u.RoleId);
        });

        modelBuilder.Entity<Role>(e =>
        {
            e.HasIndex(r => r.Name).IsUnique();
        });

        modelBuilder.Entity<Permission>(e =>
        {
            e.HasIndex(p => p.Name).IsUnique();
        });

        modelBuilder.Entity<RolePermission>(e =>
        {
            e.HasKey(rp => new { rp.RoleId, rp.PermissionId });
            e.HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);
            e.HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId);
        });

        modelBuilder.Entity<Document>(e =>
        {
            e.HasOne(d => d.UploadedBy).WithMany(u => u.Documents).HasForeignKey(d => d.UploadedById);
            e.HasOne(d => d.Category).WithMany(c => c.Documents).HasForeignKey(d => d.CategoryId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DocumentVersion>(e =>
        {
            e.HasOne(v => v.Document).WithMany(d => d.Versions).HasForeignKey(v => v.DocumentId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(v => v.UploadedBy).WithMany().HasForeignKey(v => v.UploadedById);
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 1, Name = "documents.view", Description = "View documents" },
            new Permission { Id = 2, Name = "documents.create", Description = "Create/upload documents" },
            new Permission { Id = 3, Name = "documents.edit", Description = "Edit documents" },
            new Permission { Id = 4, Name = "documents.delete", Description = "Delete documents" },
            new Permission { Id = 5, Name = "documents.download", Description = "Download documents" },
            new Permission { Id = 6, Name = "users.view", Description = "View users" },
            new Permission { Id = 7, Name = "users.create", Description = "Create users" },
            new Permission { Id = 8, Name = "users.edit", Description = "Edit users" },
            new Permission { Id = 9, Name = "users.delete", Description = "Delete users" },
            new Permission { Id = 10, Name = "roles.manage", Description = "Manage roles & permissions" }
        );

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", Description = "Full system access" },
            new Role { Id = 2, Name = "Manager", Description = "Manage documents and users" },
            new Role { Id = 3, Name = "Editor", Description = "Create and edit documents" },
            new Role { Id = 4, Name = "Viewer", Description = "View and download documents" }
        );

        modelBuilder.Entity<RolePermission>().HasData(
            // Admin gets all permissions
            new { RoleId = 1, PermissionId = 1 }, new { RoleId = 1, PermissionId = 2 },
            new { RoleId = 1, PermissionId = 3 }, new { RoleId = 1, PermissionId = 4 },
            new { RoleId = 1, PermissionId = 5 }, new { RoleId = 1, PermissionId = 6 },
            new { RoleId = 1, PermissionId = 7 }, new { RoleId = 1, PermissionId = 8 },
            new { RoleId = 1, PermissionId = 9 }, new { RoleId = 1, PermissionId = 10 },
            // Manager
            new { RoleId = 2, PermissionId = 1 }, new { RoleId = 2, PermissionId = 2 },
            new { RoleId = 2, PermissionId = 3 }, new { RoleId = 2, PermissionId = 4 },
            new { RoleId = 2, PermissionId = 5 }, new { RoleId = 2, PermissionId = 6 },
            new { RoleId = 2, PermissionId = 7 }, new { RoleId = 2, PermissionId = 8 },
            // Editor
            new { RoleId = 3, PermissionId = 1 }, new { RoleId = 3, PermissionId = 2 },
            new { RoleId = 3, PermissionId = 3 }, new { RoleId = 3, PermissionId = 5 },
            // Viewer
            new { RoleId = 4, PermissionId = 1 }, new { RoleId = 4, PermissionId = 5 }
        );

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "General", Description = "General documents" },
            new Category { Id = 2, Name = "HR", Description = "Human resources documents" },
            new Category { Id = 3, Name = "Finance", Description = "Financial documents" },
            new Category { Id = 4, Name = "Technical", Description = "Technical documentation" },
            new Category { Id = 5, Name = "Legal", Description = "Legal documents" }
        );
    }
}
