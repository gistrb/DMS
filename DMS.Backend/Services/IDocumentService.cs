using DMS.Backend.DTOs.Documents;

namespace DMS.Backend.Services;

public interface IDocumentService
{
    Task<DocumentListResponse> GetAllAsync(string? search, int? categoryId, string? sortBy, bool? descending, int page, int pageSize);
    Task<DocumentResponse?> GetByIdAsync(int id);
    Task<DocumentResponse> UploadAsync(int userId, string title, string description, int? categoryId, Stream fileStream, string fileName, string contentType);
    Task<DocumentResponse> UpdateAsync(int id, int userId, string title, string description, int? categoryId);
    Task<DocumentResponse> NewVersionAsync(int id, int userId, string changeNote, Stream fileStream, string fileName, string contentType);
    Task<bool> DeleteAsync(int id);
    Task<(Stream FileStream, string FileName, string ContentType)?> DownloadAsync(int id);
}
