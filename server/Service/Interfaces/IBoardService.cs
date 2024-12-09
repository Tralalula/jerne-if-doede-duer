using DataAccess.Models;
using Service.Models.Requests;

namespace Service.Interfaces;

public class IBoardService
{
    public async Task<Board> PlaceBoardBet(BoardPickRequest board);
}