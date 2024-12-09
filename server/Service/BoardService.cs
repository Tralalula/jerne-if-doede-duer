using DataAccess;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using Service.Exceptions;
using Service.Interfaces;
using Service.Models.Requests;

namespace Service;

public class BoardService(AppDbContext context) : IBoardService
{
    public async Task<Board> PlaceBoardBet(BoardPickRequest board)
    {
        board.SelectedNumbers = board.SelectedNumbers.OrderBy(n => n).ToList();

        Guid userId = Guid.NewGuid();

        int count = board.SelectedNumbers.Count;
        if (count < 5 || count > 8)
            throw new BadRequestException("You must pick between 5 and 8 numbers.");

        // valider board længde
        if (board.SelectedNumbers.Any(n => n < 1 || n > 16))
            throw new BadRequestException("Selected numbers must be within the range 1-16.");

        if (board.SelectedNumbers.Distinct().Count() != count)
            throw new BadRequestException("Selected numbers must be unique." );
        
        // måske skal laves om til at omregne i tidspunkt?
        var maxId = await context.Games.MaxAsync(game => game.Id);
        
        // klar til at spille
        int boardNumbers = int.Parse(string.Join("", board.SelectedNumbers));
        
        // log til købshistorik
        
        return Ok(new { message = "Selection saved successfully!", request.SelectedNumbers });
    }
}