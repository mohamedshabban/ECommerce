using Microsoft.AspNetCore.Http;

namespace ECommerce.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string folder);
    Task<IEnumerable<string>> UploadFilesAsync(IEnumerable<IFormFile> files, string folder);
    Task DeleteFileAsync(string filePath);
    Task DeleteFilesAsync(IEnumerable<string> filePaths);
    string GetFileUrl(string filePath);
}
