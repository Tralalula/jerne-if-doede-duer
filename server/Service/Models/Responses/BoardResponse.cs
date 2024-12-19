using System.ComponentModel.DataAnnotations;
using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardResponse
{
    [Required]
    public Guid BoardId { get; set; }
    
    public List<int>? Configuration { get; set; }
    
    [Required]
    public int Price { get; set; }
    
    [Required]
    public DateTime PlacedOn { get; set; }
    
    public UserResponse? User { get; set; }
    
    
    public static BoardResponse ToResponse(Board board)
    {
        var newResponse = new BoardResponse
        {
            BoardId = board.Id,
            Configuration = board.Configuration,
            PlacedOn = board.Timestamp,
            Price = board.Purchase.Price,
            User = UserResponse.FromEntity(board.User)
        };

        return newResponse;
    }
}