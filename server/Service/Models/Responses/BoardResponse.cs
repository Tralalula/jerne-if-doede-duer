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

    public BoardResponse ToResponse(Board board, User user)
    {
        var newResponse = new BoardResponse
        {
            BoardId = board.Id,
            Configuration = board.Configuration,
            PlacedOn = board.Timestamp,
            User = UserResponse.FromEntity(user)
        };

        return newResponse;
    }
}