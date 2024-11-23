using System.ComponentModel.DataAnnotations;

namespace Service;

public sealed class AppOptions
{
    [Required(ErrorMessage = "LocalDbConn is required.")]
    [MinLength(1, ErrorMessage = "LocalDbConn cannot be an empty string.")]
    public string LocalDbConn { get; set; } = null!;
    

    public required string JwtSecret { get; set; }
    
    public required string Address { get; set; }
    

    [Url]
    public required string SeqUrl { get; set; }
    
    public string AspNetCoreEnvironment { get; set; } = "";
}