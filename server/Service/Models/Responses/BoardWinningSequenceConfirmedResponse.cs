using System.ComponentModel.DataAnnotations;
using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardWinningSequenceConfirmedResponse
{
    public Guid GameId { get; set; }
    public int GameWeek { get; set; }
    public int TotalWinners { get; set; }
    
    [Required]
    public List<BoardResponse> Boards { get; set; }

}