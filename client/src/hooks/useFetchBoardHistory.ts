import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
    api,
    boardHistoryEntriesAtom,
    boardHistorySortAtom,
    boardHistoryFilterAtom,
    boardHistoryPagingAtom,
    boardHistoryLoadingAtom,
    boardHistoryErrorAtom,
} from './import';

export function useFetchBoardHistory() {
    const [entries, setEntries] = useAtom(boardHistoryEntriesAtom);
    const [sort] = useAtom(boardHistorySortAtom);
    const [filter] = useAtom(boardHistoryFilterAtom);
    const [paging, setPaging] = useAtom(boardHistoryPagingAtom);
    const [loading, setLoading] = useAtom(boardHistoryLoadingAtom);
    const [error, setError] = useAtom(boardHistoryErrorAtom);

    const fetchboardHistory = async () => {
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

            const response = await api.board.getBoardHistory(queryParams)

            setEntries(response.data.boards);
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
        fetchboardHistory();
    }, [paging.currentPage, paging.itemsPerPage,
        filter.fromDate, filter.toDate, sort.sortBy]);

    return {
        entries,
        loading,
        error,
        paging,
        setPaging,
        refresh: fetchboardHistory,
    };
}