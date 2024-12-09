using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("user_devices")]
[Index("DeviceId", Name = "ix_user_devices_device_id")]
[Index("LastUsedAt", Name = "ix_user_devices_last_used_at")]
[Index("UserId", "DeviceId", Name = "ix_user_devices_user_device", IsUnique = true)]
[Index("UserId", Name = "ix_user_devices_user_id")]
public partial class UserDevice
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("device_id")]
    public string DeviceId { get; set; } = null!;

    [Column("device_name")]
    public string DeviceName { get; set; } = null!;

    [Column("last_used_at")]
    public DateTime LastUsedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("created_by_ip")]
    public string? CreatedByIp { get; set; }

    [Column("user_agent")]
    public string? UserAgent { get; set; }

    [InverseProperty("Device")]
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    [ForeignKey("UserId")]
    [InverseProperty("UserDevices")]
    public virtual User User { get; set; } = null!;
}

