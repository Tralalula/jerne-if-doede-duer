import { atom, TransactionOrderBy, SortOrder, TransactionStatus, PagingInfo, TransactionDetailsResponse, BalanceResponse } from './import'

export const transactionSortAtom = atom({
    orderBy: TransactionOrderBy.Timestamp,
    sortBy: SortOrder.Desc,
});

export const transactionsAtom = atom<TransactionDetailsResponse[]>([]);

export const transactionStatusFilterAtom = atom<TransactionStatus | null>(null);

export const transactionPagingAtom = atom<PagingInfo>({
    currentPage: 1,
    itemsPerPage: 25,
    totalPages: 1,
    totalItems: 0,
});

export const transactionDateRangeAtom = atom({
    fromDate: null as string | null,
    toDate: null as string | null,
});

export const transactionCreditsRangeAtom = atom({
    minCredits: null as number | null,
    maxCredits: null as number | null,
});

export const balanceAtom = atom<BalanceResponse | null>(null);

export const transactionLoadingAtom = atom(false);

export const transactionErrorAtom = atom<string | null>(null);