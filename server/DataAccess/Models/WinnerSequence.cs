using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("winner_sequences")]
[Index("GameId", Name = "ix_winner_sequences_game_id")]
public partial class WinnerSequence
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("game_id")]
    public Guid GameId { get; set; }

    [Column("sequence")]
    public List<int> Sequence { get; set; } = null!;

    [ForeignKey("GameId")]
    [InverseProperty("WinnerSequences")]
    public virtual Game Game { get; set; } = null!;
}

