import { atom } from 'jotai';
import { SortOrder, PagingInfo, GameResponse } from './import';

export const GameHistoryEntriesAtom = atom<GameResponse[]>([]);

export const GameHistorySortAtom = atom({
    sortBy: SortOrder.Desc,
});

export const GameHistoryFilterAtom = atom<{
    fromDate: string | null;
    toDate: string | null;
}>({
    fromDate: null,
    toDate: null,
});

export const GameHistoryPagingAtom = atom<PagingInfo>({
    currentPage: 1,
    itemsPerPage: 25,
    totalPages: 1,
    totalItems: 0,
});

export const GameHistoryLoadingAtom = atom(false);

export const GameHistoryErrorAtom = atom<string | null>(null);