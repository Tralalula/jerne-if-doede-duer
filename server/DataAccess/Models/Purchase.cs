using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("purchases")]
public partial class Purchase
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("fields")]
    public List<int> Fields { get; set; } = null!;

    [Column("price")]
    public int Price { get; set; }

    [InverseProperty("Purchase")]
    public virtual ICollection<AutoplayBoard> AutoplayBoards { get; set; } = new List<AutoplayBoard>();

    [InverseProperty("Purchase")]
    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();
}

