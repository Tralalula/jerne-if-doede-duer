import { atom } from 'jotai';
import { SortOrder, PagingInfo, GameHistoryResponse, api } from './import';

export const gameBoardHistoryEntriesAtom = atom<GameHistoryResponse>();

export const gameBoardHistorySortAtom = atom({
    sortBy: SortOrder.Desc,
});

export const gameBoardHistoryFilterAtom = atom<{
    fromDate: string | null;
    toDate: string | null;
}>({
    fromDate: null,
    toDate: null,
});

export const gameBoardHistoryPagingAtom = atom<PagingInfo>({
    currentPage: 1,
    itemsPerPage: 25,
    totalPages: 1,
    totalItems: 0,
});

export const gameBoardHistoryLoadingAtom = atom(false);
export const gameBoardHistoryErrorAtom = atom<string | null>(null);
