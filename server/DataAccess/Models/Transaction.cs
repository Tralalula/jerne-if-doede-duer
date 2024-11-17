using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("transactions")]
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
    public string? MobilepayTransactionNumber { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Transactions")]
    public virtual User User { get; set; } = null!;
}

