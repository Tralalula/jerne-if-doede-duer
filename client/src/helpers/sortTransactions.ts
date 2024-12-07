import { TransactionDetailsResponse, TransactionOrderBy, SortOrder } from './import';

export function sortTransactions(transactions: TransactionDetailsResponse[], orderBy: TransactionOrderBy, sortBy: SortOrder): TransactionDetailsResponse[] {
    const sorted = [...transactions].sort((a, b) => {
        switch (orderBy) {
            case TransactionOrderBy.Timestamp:
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            case TransactionOrderBy.Credits:
                return a.credits - b.credits;
            case TransactionOrderBy.Status:
                return a.status.localeCompare(b.status);
            default:
                return 0;
        }
    });

    return sortBy === SortOrder.Desc ? sorted.reverse() : sorted;
}