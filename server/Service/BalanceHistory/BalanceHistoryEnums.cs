using System.Text.Json.Serialization;
using Newtonsoft.Json.Converters;

namespace Service.BalanceHistory;
[JsonConverter(typeof(StringEnumConverter))]
public enum BalanceAction
{
    UserBought,   
    UserUsed,     
    
    // ved ikke lige om vi skal bruge dem her mere? 
    AdminAssigned, 
    AdminRevoked,  
    WonPrize      // skal ikke bruges mere, da det håndteres fysisk
}