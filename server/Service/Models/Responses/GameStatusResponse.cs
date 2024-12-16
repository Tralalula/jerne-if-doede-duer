namespace Service.Models.Responses;

public class GameStatusResponse
{
    public int GameWeek { get; set; }
    public bool IsGameActive { get; set; }
    public long? StartTime { get; set; }
    public long? EndTime { get; set; }
    public int TimeLeft { get; set; }
}