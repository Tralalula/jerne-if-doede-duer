using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("boards")]
[Index("GameId", Name = "ix_boards_game_id")]
[Index("UserId", Name = "ix_boards_user_id")]
public partial class Board
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("game_id")]
    public Guid GameId { get; set; }

    [Column("configuration")]
    public List<int> Configuration { get; set; } = null!;

    [ForeignKey("GameId")]
    [InverseProperty("Boards")]
    public virtual Game Game { get; set; } = null!;

    [InverseProperty("Board")]
    public virtual ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

    [ForeignKey("UserId")]
    [InverseProperty("Boards")]
    public virtual User User { get; set; } = null!;
}

