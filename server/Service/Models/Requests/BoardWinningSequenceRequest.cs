namespace Service.Models.Requests;

public class BoardWinningSequenceRequest
{
    public List<int> SelectedNumbers { get; set; } = new List<int>();

    public static BoardWinningSequenceRequest FromNumbers(List<int> numbers)
    {
        var newEnt = new BoardWinningSequenceRequest
        {
            SelectedNumbers = numbers
        };
        return newEnt;
    }
}