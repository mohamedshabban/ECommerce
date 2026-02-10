using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace ECommerce.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _uploadPath;
    private readonly string _baseUrl;

    public FileStorageService(IConfiguration configuration)
    {
        _uploadPath = configuration["FileStorage:UploadPath"] ?? "wwwroot/uploads";
        _baseUrl = configuration["FileStorage:BaseUrl"] ?? "/uploads";
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException("Invalid file type. Allowed types: jpg, jpeg, png, gif, webp");

        var maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.Length > maxFileSize)
            throw new ArgumentException("File size exceeds the maximum limit of 5MB");

        var uploadFolder = Path.Combine(_uploadPath, folder);
        if (!Directory.Exists(uploadFolder))
            Directory.CreateDirectory(uploadFolder);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadFolder, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"{_baseUrl}/{folder}/{fileName}";
    }

    public async Task<IEnumerable<string>> UploadFilesAsync(IEnumerable<IFormFile> files, string folder)
    {
        var uploadedFiles = new List<string>();
        foreach (var file in files)
        {
            var filePath = await UploadFileAsync(file, folder);
            uploadedFiles.Add(filePath);
        }
        return uploadedFiles;
    }

    public Task DeleteFileAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return Task.CompletedTask;

        var relativePath = filePath.Replace(_baseUrl, "").TrimStart('/');
        var fullPath = Path.Combine(_uploadPath, relativePath);

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }

    public async Task DeleteFilesAsync(IEnumerable<string> filePaths)
    {
        foreach (var path in filePaths)
        {
            await DeleteFileAsync(path);
        }
    }

    public string GetFileUrl(string filePath)
    {
        return filePath;
    }
}
