import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
    api,
    gameBoardHistoryEntriesAtom,
    gameBoardHistorySortAtom,
    gameBoardHistoryFilterAtom,
    gameBoardHistoryPagingAtom,
    gameBoardHistoryLoadingAtom,
    gameBoardHistoryErrorAtom,
    GameHistoryResponse
} from './import';

export function useFetchGameBoardHistory() {
    const [entry, setEntry] = useAtom(gameBoardHistoryEntriesAtom);
    const [sort] = useAtom(gameBoardHistorySortAtom);
    const [filter] = useAtom(gameBoardHistoryFilterAtom);
    const [paging, setPaging] = useAtom(gameBoardHistoryPagingAtom);
    const [loading, setLoading] = useAtom(gameBoardHistoryLoadingAtom);
    const [error, setError] = useAtom(gameBoardHistoryErrorAtom);

    const [currentGameId, setCurrentGameId] = useState<string>("");

    const fetchGameBoardHistory = async (gameId: string) => {
        setLoading(true);

        try {
            const queryParams = {
                Page: paging.currentPage,
                PageSize: paging.itemsPerPage,
                FromDate: filter.fromDate,
                ToDate: filter.toDate,
                Sort: sort.sortBy,
            };

            const response = await api.game.getGameBoardHistory(gameId, queryParams)

            setEntry(response.data);
            setPaging((prev) => ({
                ...prev,
                totalPages: response.data.boards?.pagingInfo.totalPages ?? prev.totalPages,
                totalItems: response.data.boards?.pagingInfo.totalItems ?? prev.totalItems,
              }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke hente bræt historik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGameBoardHistory(currentGameId);
    }, [paging.currentPage, paging.itemsPerPage,
        filter.fromDate, filter.toDate, sort.sortBy, currentGameId]);

    return {
        entry,
        loading,
        error,
        paging,
        fetchGameBoardHistory,
        setCurrentGameId,
        setPaging,
        refresh: fetchGameBoardHistory,
    };
}