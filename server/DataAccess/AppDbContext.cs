using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess;

public partial class AppDbContext : IdentityDbContext<User, Role, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    public virtual DbSet<AutoplayBoard> AutoplayBoards { get; set; }

    public virtual DbSet<BalanceHistory> BalanceHistories { get; set; }

    public virtual DbSet<Board> Boards { get; set; }

    public virtual DbSet<Game> Games { get; set; }

    public virtual DbSet<Pot> Pots { get; set; }

    public virtual DbSet<Purchase> Purchases { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<UserHistory> UserHistories { get; set; }

    public virtual DbSet<WinnerSequence> WinnerSequences { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("uuid-ossp");

        
        modelBuilder.Entity<AutoplayBoard>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("autoplay_boards_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Purchase).WithMany(p => p.AutoplayBoards).HasConstraintName("autoplay_boards_purchase_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.AutoplayBoards).HasConstraintName("autoplay_boards_user_id_fkey");
        });

        modelBuilder.Entity<BalanceHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("balance_history_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.User).WithMany(p => p.BalanceHistories).HasConstraintName("balance_history_user_id_fkey");
        });

        modelBuilder.Entity<Board>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("boards_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Game).WithMany(p => p.Boards).HasConstraintName("boards_game_id_fkey");

            entity.HasOne(d => d.Purchase).WithMany(p => p.Boards).HasConstraintName("boards_purchase_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Boards).HasConstraintName("boards_user_id_fkey");
        });

        modelBuilder.Entity<Game>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("games_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.FieldCount).HasDefaultValue(16);
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Pot>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pot_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.RolloverAmount).HasDefaultValue(0);
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("purchases_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("refresh_tokens_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.ReplacedByToken).WithMany(p => p.InverseReplacedByToken).HasConstraintName("refresh_tokens_replaced_by_token_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens).HasConstraintName("refresh_tokens_user_id_fkey");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("transactions_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.User).WithMany(p => p.Transactions).HasConstraintName("transactions_user_id_fkey");
        });

        modelBuilder.Entity<UserHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_history_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.AffectedUser).WithMany(p => p.UserHistoryAffectedUsers).HasConstraintName("user_history_affected_user_id_fkey");

            entity.HasOne(d => d.ChangeMadeByUser).WithMany(p => p.UserHistoryChangeMadeByUsers)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("user_history_change_made_by_user_id_fkey");
        });

        modelBuilder.Entity<WinnerSequence>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("winner_sequences_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Game).WithMany(p => p.WinnerSequences).HasConstraintName("winner_sequences_game_id_fkey");
        });

        base.OnModelCreating(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}



