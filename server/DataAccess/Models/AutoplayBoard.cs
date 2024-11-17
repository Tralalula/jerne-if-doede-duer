using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("autoplay_boards")]
[Index("PurchaseId", Name = "ix_autoplay_boards_purchase_id")]
[Index("UserId", Name = "ix_autoplay_boards_user_id")]
public partial class AutoplayBoard
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("configuration")]
    public List<int> Configuration { get; set; } = null!;

    [Column("purchase_id")]
    public Guid PurchaseId { get; set; }

    [ForeignKey("PurchaseId")]
    [InverseProperty("AutoplayBoards")]
    public virtual Purchase Purchase { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("AutoplayBoards")]
    public virtual User User { get; set; } = null!;
}

