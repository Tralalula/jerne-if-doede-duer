import { atom } from 'jotai';
import { BalanceAction, SortOrder, PagingInfo, BalanceHistoryEntryResponse } from './import';

export const balanceHistoryEntriesAtom = atom<BalanceHistoryEntryResponse[]>([]);

export const balanceHistorySortAtom = atom({
    sortBy: SortOrder.Desc,
});

export const balanceHistoryFilterAtom = atom<{
    action: BalanceAction | null;
    fromDate: string | null;
    toDate: string | null;
}>({
    action: null,
    fromDate: null,
    toDate: null,
});

export const balanceHistoryPagingAtom = atom<PagingInfo>({
    currentPage: 1,
    itemsPerPage: 25,
    totalPages: 1,
    totalItems: 0,
});

export const balanceHistoryLoadingAtom = atom(false);

export const balanceHistoryErrorAtom = atom<string | null>(null);