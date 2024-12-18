using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardWinningSequenceResponse
{
    public int WinnerAmounts { get; set; }
    public Guid GameId { get; set; }
    public int CurrentGameField { get; set; }
    public List<int> SelectedNumbers { get; set; }

    public static BoardWinningSequenceResponse FromEntity(int winnerAmounts, List<int> selectedNumbers, Game game)
    {
        var newResponse = new BoardWinningSequenceResponse
        {
            WinnerAmounts = winnerAmounts,
            GameId = game.Id,
            CurrentGameField = game.FieldCount,
            SelectedNumbers = selectedNumbers
        };
        return newResponse;
    }
}