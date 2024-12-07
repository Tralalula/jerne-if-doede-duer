namespace Service.Transaction;

public record CreateTransactionRequest(int Credits, string MobilePayTransactionNumber);