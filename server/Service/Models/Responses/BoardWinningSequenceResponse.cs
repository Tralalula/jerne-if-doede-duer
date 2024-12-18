using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardWinningSequenceResponse
{
    public int WinnerAmounts { get; set; }
    private Guid GameId { get; set; }
    public int CurrentGameField { get; set; }

    public static BoardWinningSequenceResponse FromEntity(int winnerAmounts, Game game)
    {
        var newResponse = new BoardWinningSequenceResponse
        {
            WinnerAmounts = winnerAmounts,
            GameId = game.Id,
            CurrentGameField = game.FieldCount
        };
        return newResponse;
    }
}