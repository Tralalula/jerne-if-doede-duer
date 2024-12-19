namespace Service.Models.Responses;

public class BoardHistoryResponse : BoardResponse
{
    public Guid GameId { get; set; }
    public int GameWeek { get; set; }
    public bool WasWin { get; set; }
}