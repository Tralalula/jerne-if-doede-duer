using System.ComponentModel.DataAnnotations;
using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardPickResponse
{
    [Required]
    public Guid PurchaseId { get; set; }
    
    [Required]
    public List<int> SelectedNumbers { get; set; }
    
    [Required]
    public int Amount { get; set; }
    
    [Required]
    public int Total { get; set; }
    
    public static BoardPickResponse FromEntity(Purchase purchase, Board board, int amount)
    {
        return new BoardPickResponse
        {
            PurchaseId = purchase.Id,
            SelectedNumbers = board.Configuration,
            Amount = amount,
            Total = purchase.Price
        };
    }
}