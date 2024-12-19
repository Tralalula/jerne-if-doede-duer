namespace Service.Models.Responses;

public class GameResponse
{
    public Guid Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int Week { get; set; }
}