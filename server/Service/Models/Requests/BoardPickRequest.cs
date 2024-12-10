using DataAccess.Models;

namespace Service.Models.Requests;

public class BoardPickRequest()
{
    public int Amount { get; set; }
    public List<int> SelectedNumbers { get; set; } = new List<int>();

    public Purchase ToPurchase()
    {
        var newPurchase = new Purchase
        {
            Id = Guid.NewGuid()
        };
        return newPurchase;
    }

    public Board ToBoard(User user, Game game, Purchase purchase)
    {
        var newBoard = new Board
        {
            Id = Guid.NewGuid(),
            Configuration = this.SelectedNumbers,
            Game = game,
            GameId = game.Id,
            Purchase = purchase,
            Timestamp = DateTime.UtcNow,
            UserId = user.Id,
            User = user
        };
        
        return newBoard;
    }
}