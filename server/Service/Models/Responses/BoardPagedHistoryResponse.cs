using System.ComponentModel.DataAnnotations;

namespace Service.Models.Responses;

public class BoardPagedHistoryResponse
{
    [Required]
    public List<BoardHistoryResponse> Boards { get; set; } = null!;
    
    [Required]
    public PagingInfo PagingInfo { get; set; } = new();
}