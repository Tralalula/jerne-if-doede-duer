using System.ComponentModel.DataAnnotations;

namespace Service;

public sealed class AppOptions
{
    public string LocalDbConn { get; set; } = ""; 
    public string JwtSecret { get; set; } = "";
    public string Address { get; set; } = "";
    public string ClientUrl { get; set; } = "";
    public string SeqUrl { get; set; } = "";
    public string AspNetCoreEnvironment { get; set; } = "";
}