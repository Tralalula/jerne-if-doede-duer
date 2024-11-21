using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

public partial class User
{
    [InverseProperty("User")]
    public virtual ICollection<AutoplayBoard> AutoplayBoards { get; set; } = new List<AutoplayBoard>();

    [InverseProperty("User")]
    public virtual ICollection<BalanceHistory> BalanceHistories { get; set; } = new List<BalanceHistory>();

    [InverseProperty("User")]
    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();

    [InverseProperty("User")]
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    [InverseProperty("User")]
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    [InverseProperty("AffectedUser")]
    public virtual ICollection<UserHistory> UserHistoryAffectedUsers { get; set; } = new List<UserHistory>();

    [InverseProperty("ChangeMadeByUser")]
    public virtual ICollection<UserHistory> UserHistoryChangeMadeByUsers { get; set; } = new List<UserHistory>();
}


