using DataAccess.Models;

namespace Service.Models.Requests;

public class BoardPickRequest()
{
    public int Amount { get; set; }
    public List<int> SelectedNumbers { get; set; } = new List<int>();
    
    public Board ToBoard(User user, Game game, TimeProvider timeProvider, Purchase purchase)
    {
        var newBoard = new Board
        {
            Configuration = this.SelectedNumbers,
            Game = game,
            GameId = game.Id,
            Timestamp = timeProvider.GetUtcNow().UtcDateTime,
            UserId = user.Id,
            User = user
        };
        
        return newBoard;
    }
}