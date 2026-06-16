using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DMS.Backend.DTOs.Documents;
using DMS.Backend.Services;

namespace DMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<ActionResult<DocumentListResponse>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] string? sortBy,
        [FromQuery] bool? descending,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _documentService.GetAllAsync(search, categoryId, sortBy, descending, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentResponse>> GetById(int id)
    {
        var doc = await _documentService.GetByIdAsync(id);
        if (doc == null) return NotFound();
        return Ok(doc);
    }

    [HttpPost("upload")]
    [Authorize(Policy = "RequirePermission.documents.create")]
    public async Task<ActionResult<DocumentResponse>> Upload(
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] int? categoryId,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        using var stream = file.OpenReadStream();
        var result = await _documentService.UploadAsync(userId, title, description ?? "", categoryId, stream, file.FileName, file.ContentType);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "RequirePermission.documents.edit")]
    public async Task<ActionResult<DocumentResponse>> Update(int id, [FromBody] UpdateDocumentRequest request)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var result = await _documentService.UpdateAsync(id, userId, request.Title, request.Description, request.CategoryId);
        return Ok(result);
    }

    [HttpPost("{id}/version")]
    [Authorize(Policy = "RequirePermission.documents.create")]
    public async Task<ActionResult<DocumentResponse>> NewVersion(int id, [FromForm] string? changeNote, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        using var stream = file.OpenReadStream();
        var result = await _documentService.NewVersionAsync(id, userId, changeNote ?? "", stream, file.FileName, file.ContentType);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "RequirePermission.documents.delete")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _documentService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpGet("{id}/download")]
    [Authorize(Policy = "RequirePermission.documents.download")]
    public async Task<ActionResult> Download(int id)
    {
        var result = await _documentService.DownloadAsync(id);
        if (result == null) return NotFound();

        var (stream, fileName, contentType) = result.Value;
        return File(stream, contentType, fileName);
    }
}

public class UpdateDocumentRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
}
