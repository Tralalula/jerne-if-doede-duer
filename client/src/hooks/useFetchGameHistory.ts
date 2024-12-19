import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
    api,
    GameHistoryEntriesAtom,
    GameHistorySortAtom,
    GameHistoryFilterAtom,
    GameHistoryPagingAtom,
    GameHistoryLoadingAtom,
    GameHistoryErrorAtom,
} from './import';

export function useFetchGameHistory() {
    const [entries, setEntries] = useAtom(GameHistoryEntriesAtom);
    const [sort] = useAtom(GameHistorySortAtom);
    const [filter] = useAtom(GameHistoryFilterAtom);
    const [paging, setPaging] = useAtom(GameHistoryPagingAtom);
    const [loading, setLoading] = useAtom(GameHistoryLoadingAtom);
    const [error, setError] = useAtom(GameHistoryErrorAtom);

    const fetchGameHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = {
                Page: paging.currentPage,
                PageSize: paging.itemsPerPage,
                FromDate: filter.fromDate,
                ToDate: filter.toDate,
                Sort: sort.sortBy,
            };

            const response = await api.game.getHistory(queryParams)

            setEntries(response.data.games);
            setPaging(prev => ({
                ...prev,
                totalPages: response.data.pagingInfo.totalPages,
                totalItems: response.data.pagingInfo.totalItems,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke hente bræt historik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGameHistory();
    }, [paging.currentPage, paging.itemsPerPage,
        filter.fromDate, filter.toDate, sort.sortBy]);

    return {
        entries,
        loading,
        error,
        paging,
        setPaging,
        refresh: fetchGameHistory,
    };
}