using System.ComponentModel.DataAnnotations;
using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardWinningSequenceResponse
{
    [Required]
    public int WinnerAmounts { get; set; }
    
    [Required]
    public Guid GameId { get; set; }
    
    [Required]
    public int CurrentGameField { get; set; }
    
    [Required]
    public List<int>? SelectedNumbers { get; set; }

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