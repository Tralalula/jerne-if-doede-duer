using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("transactions")]
[Index("Status", Name = "ix_transactions_status")]
[Index("Timestamp", Name = "ix_transactions_timestamp")]
[Index("UserId", Name = "ix_transactions_user_id")]
public partial class Transaction
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("credits")]
    public int Credits { get; set; }

    [Column("mobilepay_transaction_number")]
    [StringLength(50)]
    public string MobilepayTransactionNumber { get; set; } = null!;

    [Column("status")]
    [StringLength(20)]
    public string Status { get; set; } = null!;

    [Column("reviewed_by_user_id")]
    public Guid? ReviewedByUserId { get; set; }

    [Column("reviewed_at")]
    public DateTime? ReviewedAt { get; set; }

    [ForeignKey("ReviewedByUserId")]
    [InverseProperty("TransactionReviewedByUsers")]
    public virtual User? ReviewedByUser { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("TransactionUsers")]
    public virtual User User { get; set; } = null!;
}

