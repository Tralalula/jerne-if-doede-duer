using System.ComponentModel.DataAnnotations;

namespace Service;

public class AppOptions
{
    [Required(ErrorMessage = "LocalDbConn is required.")]
    [MinLength(1, ErrorMessage = "LocalDbConn cannot be an empty string.")]
    public string LocalDbConn { get; set; } = null!;
}