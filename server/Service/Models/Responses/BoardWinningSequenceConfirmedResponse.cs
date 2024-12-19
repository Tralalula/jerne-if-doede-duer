using System.ComponentModel.DataAnnotations;
using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardWinningSequenceConfirmedResponse
{
    [Required]
    public Guid GameId { get; set; }
    
    [Required]
    public int GameWeek { get; set; }
    
    [Required]
    public int TotalWinners { get; set; }
    
    [Required]
    public List<BoardResponse>? Boards { get; set; }

}