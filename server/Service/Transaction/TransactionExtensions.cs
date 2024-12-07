namespace Service.Transaction;

public static class TransactionExtensions
{
    public static string ToDbString(this TransactionStatus status) => status.ToString().ToLower();
    
    public static TransactionStatus ToTransactionStatus(this string status) => Enum.Parse<TransactionStatus>(status, true);
}