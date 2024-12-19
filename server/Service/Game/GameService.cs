using Service.Models.Responses;

namespace Service;

public interface IGameService
{
    public Task<GamePagedResponse> GetBoardsHistory(Guid userId, GameHistoryQuery query);
}

public class GameService : IGameService
{
    public async Task<GamePagedResponse> GetBoardsHistory(Guid userId, GameHistoryQuery query)
    {

        return new GamePagedResponse();
    }
}