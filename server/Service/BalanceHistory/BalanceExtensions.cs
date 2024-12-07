namespace Service.BalanceHistory;

public static class BalanceExtensions 
{
    public static string ToDbString(this BalanceAction action) => action.ToString().ToLower();
    
    public static BalanceAction ToBalanceAction(this string action) => Enum.Parse<BalanceAction>(action, true);
}