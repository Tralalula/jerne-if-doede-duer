using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("balance_history")]
[Index("Action", Name = "ix_balance_history_action")]
[Index("Timestamp", Name = "ix_balance_history_timestamp")]
[Index("UserId", Name = "ix_balance_history_user_id")]
public partial class BalanceHistory
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("amount")]
    public int Amount { get; set; }

    [Column("additional_id")]
    public Guid? AdditionalId { get; set; }

    [Column("action")]
    [StringLength(50)]
    public string Action { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("BalanceHistories")]
    public virtual User User { get; set; } = null!;
}

