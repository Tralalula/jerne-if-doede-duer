using DataAccess.Models;

namespace Service.Models.Requests;

public class BoardPickRequest
{
    public List<int> SelectedNumbers { get; set; } = new List<int>();

    public Purchase toPurchase()
    {
        var newPurchase = new Purchase
        {
            Id = Guid.NewGuid(),
            
        }
    }
}