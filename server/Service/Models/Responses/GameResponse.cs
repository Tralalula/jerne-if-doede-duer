using DataAccess.Models;

namespace Service.Models.Responses;

public class GameResponse
{
    public Guid Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int Week { get; set; }
    public bool Active { get; set; }
    public int Entries { get; set; }
    public int TotalPool { get; set; }

    public static GameResponse FromEntity(Game game)
    {
        return new GameResponse
        {
            Id = game.Id,
            StartTime = game.StartTime,
            EndTime = game.EndTime,
            Week = game.FieldCount,
            Active = game.Active,
            Entries = game.Boards.Count,
            TotalPool = game.Boards.Sum(b => b.Purchase.Price)
        };
    }
}
