using Microsoft.EntityFrameworkCore;
using DMS.Backend.Data;
using DMS.Backend.DTOs.Documents;
using DMS.Backend.Models;

namespace DMS.Backend.Services;

public class DocumentService : IDocumentService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public DocumentService(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    public async Task<DocumentListResponse> GetAllAsync(string? search, int? categoryId, string? sortBy, bool? descending, int page, int pageSize)
    {
        var query = _db.Documents
            .Include(d => d.UploadedBy)
            .Include(d => d.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(d => d.Title.Contains(search) || d.Description.Contains(search));

        if (categoryId.HasValue)
            query = query.Where(d => d.CategoryId == categoryId);

        query = (sortBy?.ToLower()) switch
        {
            "title" => descending == true ? query.OrderByDescending(d => d.Title) : query.OrderBy(d => d.Title),
            "created" => descending == true ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt),
            "size" => descending == true ? query.OrderByDescending(d => d.FileSize) : query.OrderBy(d => d.FileSize),
            _ => query.OrderByDescending(d => d.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DocumentResponse
            {
                Id = d.Id,
                Title = d.Title,
                Description = d.Description,
                FileName = d.FileName,
                ContentType = d.ContentType,
                FileSize = d.FileSize,
                Version = d.Version,
                UploadedByName = d.UploadedBy.FullName,
                CategoryName = d.Category != null ? d.Category.Name : null,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            })
            .ToListAsync();

        return new DocumentListResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<DocumentResponse?> GetByIdAsync(int id)
    {
        return await _db.Documents
            .Include(d => d.UploadedBy)
            .Include(d => d.Category)
            .Where(d => d.Id == id)
            .Select(d => new DocumentResponse
            {
                Id = d.Id,
                Title = d.Title,
                Description = d.Description,
                FileName = d.FileName,
                ContentType = d.ContentType,
                FileSize = d.FileSize,
                Version = d.Version,
                UploadedByName = d.UploadedBy.FullName,
                CategoryName = d.Category != null ? d.Category.Name : null,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<DocumentResponse> UploadAsync(int userId, string title, string description, int? categoryId, Stream fileStream, string fileName, string contentType)
    {
        var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads");
        Directory.CreateDirectory(uploadsDir);

        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(uploadsDir, uniqueFileName);

        using (var fs = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fs);
        }

        var fileInfo = new FileInfo(filePath);

        var document = new Document
        {
            Title = title,
            Description = description,
            FilePath = filePath,
            FileName = fileName,
            ContentType = contentType,
            FileSize = fileInfo.Length,
            Version = 1,
            UploadedById = userId,
            CategoryId = categoryId
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync();

        return (await GetByIdAsync(document.Id))!;
    }

    public async Task<DocumentResponse> UpdateAsync(int id, int userId, string title, string description, int? categoryId)
    {
        var doc = await _db.Documents.FindAsync(id)
            ?? throw new KeyNotFoundException("Document not found.");

        doc.Title = title;
        doc.Description = description;
        doc.CategoryId = categoryId;
        doc.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return (await GetByIdAsync(doc.Id))!;
    }

    public async Task<DocumentResponse> NewVersionAsync(int id, int userId, string changeNote, Stream fileStream, string fileName, string contentType)
    {
        var doc = await _db.Documents.FindAsync(id)
            ?? throw new KeyNotFoundException("Document not found.");

        var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads");
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(uploadsDir, uniqueFileName);

        using (var fs = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fs);
        }

        var fileInfo = new FileInfo(filePath);

        doc.Version++;
        doc.FilePath = filePath;
        doc.FileName = fileName;
        doc.ContentType = contentType;
        doc.FileSize = fileInfo.Length;
        doc.UpdatedAt = DateTime.UtcNow;

        var version = new DocumentVersion
        {
            DocumentId = doc.Id,
            VersionNumber = doc.Version,
            FilePath = filePath,
            FileName = fileName,
            FileSize = fileInfo.Length,
            ChangeNote = changeNote,
            UploadedById = userId
        };

        _db.DocumentVersions.Add(version);
        await _db.SaveChangesAsync();

        return (await GetByIdAsync(doc.Id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var doc = await _db.Documents.FindAsync(id);
        if (doc == null) return false;

        if (File.Exists(doc.FilePath))
            File.Delete(doc.FilePath);

        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<(Stream FileStream, string FileName, string ContentType)?> DownloadAsync(int id)
    {
        var doc = await _db.Documents.FindAsync(id);
        if (doc == null || !File.Exists(doc.FilePath))
            return null;

        var stream = new FileStream(doc.FilePath, FileMode.Open, FileAccess.Read);
        return (stream, doc.FileName, doc.ContentType);
    }
}
