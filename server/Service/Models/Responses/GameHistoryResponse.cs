using DataAccess.Models;

namespace Service.Models.Responses;

public class GameHistoryResponse : GameResponse
{
    public int TotalWinAmount { get; set; }
    public List<int> WinningSequence { get; set; } = new();
    public BoardHistoryPagedResponse? Boards { get; set; }

    public static GameHistoryResponse FromEntity(Game game, int totalWinAmount, BoardHistoryPagedResponse boards, List<int> winnerSequence)
    {
        return new GameHistoryResponse
        {
            Id = game.Id,
            StartTime = game.StartTime,
            EndTime = game.EndTime,
            Week = game.FieldCount,
            Active = game.Active,
            Entries = game.Boards.Count,
            WinningSequence = winnerSequence,
            Boards = boards,
            TotalPool = game.Boards.Sum(b => b.Purchase.Price),
            TotalWinAmount = totalWinAmount
        };
    }
}