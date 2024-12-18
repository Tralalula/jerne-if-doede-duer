using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("games")]
[Index("EndTime", Name = "ix_games_end_time")]
[Index("StartTime", Name = "ix_games_start_time")]
public partial class Game
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("start_time")]
    public DateTime StartTime { get; set; }

    [Column("end_time")]
    public DateTime EndTime { get; set; }

    [Column("active")]
    public bool Active { get; set; }

    [Column("field_count")]
    public int FieldCount { get; set; }

    [InverseProperty("Game")]
    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();

    [InverseProperty("Game")]
    public virtual ICollection<WinnerSequence> WinnerSequences { get; set; } = new List<WinnerSequence>();
}

