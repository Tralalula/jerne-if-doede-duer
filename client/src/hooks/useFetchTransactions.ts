import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
    api,
    TransactionDetailsResponse, 
    transactionsAtom,
    transactionSortAtom,
    transactionStatusFilterAtom,
    transactionPagingAtom,
    transactionDateRangeAtom,
    transactionCreditsRangeAtom,
    transactionLoadingAtom,
    transactionErrorAtom,
    jwtAtom
} from './import';

interface UseTransactionsParams {
    isAdmin?: boolean;
}

export function useFetchTransactions({ isAdmin = false }: UseTransactionsParams = {}) {
    const [transactions, setTransactions] = useAtom(transactionsAtom);
    const [sort] = useAtom(transactionSortAtom);
    const [status] = useAtom(transactionStatusFilterAtom);
    const [paging, setPaging] = useAtom(transactionPagingAtom);
    const [dateRange] = useAtom(transactionDateRangeAtom);
    const [creditsRange] = useAtom(transactionCreditsRangeAtom);
    const [loading, setLoading] = useAtom(transactionLoadingAtom);
    const [error, setError] = useAtom(transactionErrorAtom);

    const jwt = useAtomValue(jwtAtom);
    
    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await (isAdmin
                ? api.transaction.getAllTransactions({
                    Page: paging.currentPage,
                    PageSize: paging.itemsPerPage,
                    Status: status,
                    OrderBy: sort.orderBy,
                    Sort: sort.sortBy,
                    FromDate: dateRange.fromDate,
                    ToDate: dateRange.toDate,
                    MinCredits: creditsRange.minCredits,
                    MaxCredits: creditsRange.maxCredits,
                })
                : api.transaction.getMyTransactions({
                    Page: paging.currentPage,
                    PageSize: paging.itemsPerPage,
                    Status: status,
                    OrderBy: sort.orderBy,
                    Sort: sort.sortBy,
                    FromDate: dateRange.fromDate,
                    ToDate: dateRange.toDate,
                    MinCredits: creditsRange.minCredits,
                    MaxCredits: creditsRange.maxCredits,
                }));

            setTransactions(response.data.items);
            setPaging(prev => ({
                ...prev,
                totalPages: response.data.pagingInfo.totalPages,
                totalItems: response.data.pagingInfo.totalItems,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke hente transaktioner');
        } finally {
            setLoading(false);
        }
    };

    const updateTransactionLocally = (id: string, updater: (transaction: TransactionDetailsResponse) => TransactionDetailsResponse) => {
        setTransactions(prev =>
            prev.map(transaction => transaction.id === id ? updater(transaction) : transaction)
        );
    };

    const acceptTransaction = async (id: string) => {
        try {
            await api.transaction.acceptTransaction(id);
            updateTransactionLocally(id, t => ({
                ...t,
                reviewedAt: new Date().toISOString(), // hm? Her eller server?
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Problemer med at acceptere transaktion');
            fetchTransactions(); 
        }
    };


    const denyTransaction = async (id: string) => {
        try {
            await api.transaction.denyTransaction(id);
            updateTransactionLocally(id, t => ({
                ...t,
                reviewedAt: new Date().toISOString(), // hm? Her eller server?
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Problemer med at afvise transaktion');
            fetchTransactions(); 
        }
    };

    useEffect(() => { if (jwt) { fetchTransactions(); } }, [isAdmin, paging.currentPage, paging.itemsPerPage, status, 
                                                                dateRange.fromDate, dateRange.toDate,creditsRange.minCredits, creditsRange.maxCredits]);
    
    return {
        transactions,
        loading,
        error,
        paging,
        setPaging,
        acceptTransaction,
        denyTransaction,
        refresh: fetchTransactions,
    };
};