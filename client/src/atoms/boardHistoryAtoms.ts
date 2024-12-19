import { atom } from 'jotai';
import { SortOrder, PagingInfo, BoardHistoryResponse } from './import';

export const boardHistoryEntriesAtom = atom<BoardHistoryResponse[]>([]);

export const boardHistorySortAtom = atom({
    sortBy: SortOrder.Desc,
});

export const boardHistoryFilterAtom = atom<{
    fromDate: string | null;
    toDate: string | null;
}>({
    fromDate: null,
    toDate: null,
});

export const boardHistoryPagingAtom = atom<PagingInfo>({
    currentPage: 1,
    itemsPerPage: 25,
    totalPages: 1,
    totalItems: 0,
});

export const boardHistoryLoadingAtom = atom(false);

export const boardHistoryErrorAtom = atom<string | null>(null);