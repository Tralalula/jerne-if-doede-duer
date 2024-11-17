using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("user_history")]
[Index("AffectedUserId", Name = "ix_user_history_affected_user_id")]
[Index("ChangeMadeByUserId", Name = "ix_user_history_change_made_by_user_id")]
[Index("Timestamp", Name = "ix_user_history_timestamp")]
public partial class UserHistory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("affected_user_id")]
    public Guid AffectedUserId { get; set; }

    [Column("change_made_by_user_id")]
    public Guid ChangeMadeByUserId { get; set; }

    [Column("email")]
    [StringLength(256)]
    public string Email { get; set; } = null!;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = null!;

    [Column("phone_number")]
    public string PhoneNumber { get; set; } = null!;

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [ForeignKey("AffectedUserId")]
    [InverseProperty("UserHistoryAffectedUsers")]
    public virtual User AffectedUser { get; set; } = null!;

    [ForeignKey("ChangeMadeByUserId")]
    [InverseProperty("UserHistoryChangeMadeByUsers")]
    public virtual User ChangeMadeByUser { get; set; } = null!;
}

