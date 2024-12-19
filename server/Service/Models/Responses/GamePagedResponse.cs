using System.ComponentModel.DataAnnotations;

namespace Service.Models.Responses;

public class GamePagedResponse
{
    [Required]
    public List<GameResponse> Games { get; set; } = null!;

    [Required]
    public PagingInfo PagingInfo { get; set; } = new();
}