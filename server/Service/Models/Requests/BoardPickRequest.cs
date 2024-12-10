using DataAccess.Models;

namespace Service.Models.Requests;

public class BoardPickRequest()
{
    public int Amount { get; set; }
    public List<int> SelectedNumbers { get; set; } = new List<int>();

    public Purchase ToPurchase(TimeProvider timeProvider, int totalPrice)
    {
        var newPurchase = new Purchase
        {
            Price = totalPrice,
            Timestamp = timeProvider.GetUtcNow().UtcDateTime
        };
        return newPurchase;
    }
    public Board ToBoard(User user, Game game, TimeProvider timeProvider, Purchase purchase)
    {
        var newBoard = new Board
        {
            Configuration = this.SelectedNumbers,
            Game = game,
            GameId = game.Id,
            Timestamp = timeProvider.GetUtcNow().UtcDateTime,
            PurchaseId = purchase.Id,
            UserId = user.Id,
            User = user
        };
        
        return newBoard;
    }
}