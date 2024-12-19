using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardGameHistoryResponse : BoardResponse
{
    public bool WasWin { get; set; }
    
    public static BoardGameHistoryResponse ToResponse(Board board, bool wasWin, int price)
    {
        var newResponse = new BoardGameHistoryResponse
        {
            BoardId = board.Id,
            Configuration = board.Configuration,
            PlacedOn = board.Timestamp,
            Price = price,
            User = UserResponse.FromEntity(board.User),
            WasWin = wasWin
        };

        return newResponse;
    }
}