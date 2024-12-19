using System.ComponentModel.DataAnnotations;

namespace Service.Models.Responses;

public class BoardHistoryPagedResponse
{
    [Required]
    public List<BoardGameHistoryResponse>? Boards { get; set; }

    [Required]
    public PagingInfo PagingInfo { get; set; } = new();

    public static BoardHistoryPagedResponse ToResponse(List<BoardGameHistoryResponse> boards, PagingInfo pagingInfo)
    {
        return new BoardHistoryPagedResponse
        {
            Boards = boards,
            PagingInfo = pagingInfo
        };
    }
}