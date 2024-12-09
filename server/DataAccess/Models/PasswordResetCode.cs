using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("password_reset_codes")]
[Index("Email", Name = "ix_password_reset_codes_email")]
[Index("ExpiresAt", Name = "ix_password_reset_codes_expires_at")]
public partial class PasswordResetCode
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("email")]
    [StringLength(256)]
    public string Email { get; set; } = null!;

    [Column("code")]
    [StringLength(6)]
    public string Code { get; set; } = null!;

    [Column("token")]
    public string Token { get; set; } = null!;

    [Column("is_used")]
    public bool IsUsed { get; set; }

    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [Column("attempt_count")]
    public int AttemptCount { get; set; }
}

