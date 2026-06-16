using System.ComponentModel.DataAnnotations;

namespace DMS.Backend.Models;

public class DocumentVersion
{
    public int Id { get; set; }

    public int VersionNumber { get; set; }

    [Required, MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string FileName { get; set; } = string.Empty;

    public long FileSize { get; set; }

    [MaxLength(500)]
    public string ChangeNote { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int DocumentId { get; set; }
    public Document Document { get; set; } = null!;

    public int UploadedById { get; set; }
    public User UploadedBy { get; set; } = null!;
}
