import { atom } from 'jotai';
import { UserOrderBy, SortOrder, UserStatus, RoleType, PagingInfo, UserDetailsResponse } from './import';

export const userSortAtom = atom({
    orderBy: UserOrderBy.Email,
    sortBy: SortOrder.Asc,
});

export const usersAtom = atom<UserDetailsResponse[]>([]);

export const userStatusFilterAtom = atom<UserStatus | null>(null);

export const userRoleFilterAtom = atom<RoleType | null>(null);

export const userSearchAtom = atom<string | null>(null);

export const userPagingAtom = atom<PagingInfo>({
    currentPage: 1,
    itemsPerPage: 25,
    totalPages: 1,
    totalItems: 0,
});

export const userLoadingAtom = atom(false);

export const userErrorAtom = atom<string | null>(null);