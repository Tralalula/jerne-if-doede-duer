import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
    api,
    balanceHistoryEntriesAtom,
    balanceHistorySortAtom,
    balanceHistoryFilterAtom,
    balanceHistoryPagingAtom,
    balanceHistoryLoadingAtom,
    balanceHistoryErrorAtom,
} from './import';

interface UseFetchBalanceHistoryParams {
    isAdmin?: boolean;
    userId?: string;
}

export function useFetchBalanceHistory({ isAdmin = false, userId }: UseFetchBalanceHistoryParams = {}) {
    const [entries, setEntries] = useAtom(balanceHistoryEntriesAtom);
    const [sort] = useAtom(balanceHistorySortAtom);
    const [filter] = useAtom(balanceHistoryFilterAtom);
    const [paging, setPaging] = useAtom(balanceHistoryPagingAtom);
    const [loading, setLoading] = useAtom(balanceHistoryLoadingAtom);
    const [error, setError] = useAtom(balanceHistoryErrorAtom);

    const fetchBalanceHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = {
                Page: paging.currentPage,
                PageSize: paging.itemsPerPage,
                Action: filter.action,
                FromDate: filter.fromDate,
                ToDate: filter.toDate,
                Sort: sort.sortBy,
            };

            const response = userId ?
                await api.balancehistory.getUserBalanceHistory(userId, queryParams) :
                isAdmin ?
                    await api.balancehistory.getAllBalanceHistory(queryParams) :
                    await api.balancehistory.getMyBalanceHistory(queryParams);

            setEntries(response.data.items);
            setPaging(prev => ({
                ...prev,
                totalPages: response.data.pagingInfo.totalPages,
                totalItems: response.data.pagingInfo.totalItems,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke hente saldohistorik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalanceHistory();
    }, [isAdmin, userId, paging.currentPage, paging.itemsPerPage, filter.action,
        filter.fromDate, filter.toDate, sort.sortBy]);

    return {
        entries,
        loading,
        error,
        paging,
        setPaging,
        refresh: fetchBalanceHistory,
    };
}