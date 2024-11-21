using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("refresh_tokens")]
[Index("ExpiresAt", Name = "ix_refresh_tokens_expires_at")]
[Index("UserId", Name = "ix_refresh_tokens_user_id")]
public partial class RefreshToken
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("token")]
    public string Token { get; set; } = null!;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("revoked_at")]
    public DateTime? RevokedAt { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("revoked_by_ip")]
    public string? RevokedByIp { get; set; }

    [Column("created_by_ip")]
    public string? CreatedByIp { get; set; }

    [Column("replaced_by_token")]
    public string? ReplacedByToken { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("RefreshTokens")]
    public virtual User User { get; set; } = null!;
}

