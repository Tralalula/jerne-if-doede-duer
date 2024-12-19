using System.Text.Json.Serialization;
using Newtonsoft.Json.Converters;

namespace Service.BalanceHistory;
[JsonConverter(typeof(StringEnumConverter))]
public enum BalanceAction
{
    UserBought,   
    UserUsed,     
}
