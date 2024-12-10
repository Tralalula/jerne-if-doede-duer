using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("purchases")]
[Index("BoardId", Name = "ix_purchases_board_id")]
public partial class Purchase
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("board_id")]
    public Guid BoardId { get; set; }

    [Column("price")]
    public int Price { get; set; }

    [InverseProperty("Purchase")]
    public virtual ICollection<AutoplayBoard> AutoplayBoards { get; set; } = new List<AutoplayBoard>();

    [ForeignKey("BoardId")]
    [InverseProperty("Purchases")]
    public virtual Board Board { get; set; } = null!;
}

