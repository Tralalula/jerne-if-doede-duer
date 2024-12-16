using System.ComponentModel.DataAnnotations;
using DataAccess.Models;

namespace Service.Models.Responses;

public class BoardPickResponse
{
    [Required]
    public List<Board> Board { get; set; }
    
    public static BoardPickResponse FromEntity(List<Board> board)
    {
        return new BoardPickResponse
        {
            Board = board
        };
    }
}