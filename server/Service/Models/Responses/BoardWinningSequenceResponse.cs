using System.ComponentModel.DataAnnotations;
using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardWinningSequenceResponse
{
    [Required]
    public List<BoardResponse> Boards { get; set; }

}