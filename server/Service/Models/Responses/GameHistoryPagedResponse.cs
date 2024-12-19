using System.ComponentModel.DataAnnotations;

namespace Service.Models.Responses;

public class GameHistoryPagedResponse
{
    [Required]
    public List<GameResponse> Games { get; set; } = new();

    [Required]
    public PagingInfo PagingInfo { get; set; } = new();

    public static GameHistoryPagedResponse FromEntity(List<GameResponse> gameResponses, PagingInfo pagingInfo)
    {
        return new GameHistoryPagedResponse
        {
            Games = gameResponses,
            PagingInfo = pagingInfo
        };
    }
}
