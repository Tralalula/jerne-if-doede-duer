import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
    api,
    UserDetailsResponse,
    usersAtom,
    userSortAtom,
    userStatusFilterAtom,
    userPagingAtom,
    userSearchAtom,
    userRoleFilterAtom,
    userLoadingAtom,
    userErrorAtom,
} from './import';

export function useFetchUsers() {
    const [users, setUsers] = useAtom(usersAtom);
    const [sort] = useAtom(userSortAtom);
    const [status] = useAtom(userStatusFilterAtom);
    const [paging, setPaging] = useAtom(userPagingAtom);
    const [search] = useAtom(userSearchAtom);
    const [role] = useAtom(userRoleFilterAtom);
    const [loading, setLoading] = useAtom(userLoadingAtom);
    const [error, setError] = useAtom(userErrorAtom);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.user.getUsers({
                Page: paging.currentPage,
                PageSize: paging.itemsPerPage,
                Status: status,
                Search: search,
                Role: role,
                OrderBy: sort.orderBy,
                Sort: sort.sortBy,
            });

            setUsers(response.data.items);
            setPaging(prev => ({
                ...prev,
                totalPages: response.data.pagingInfo.totalPages,
                totalItems: response.data.pagingInfo.totalItems,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke hente brugere');
        } finally {
            setLoading(false);
        }
    };

    const updateUserLocally = (id: string, updater: (user: UserDetailsResponse) => UserDetailsResponse) => {
        setUsers(prev =>
            prev.map(user => user.id === id ? updater(user) : user)
        );
    };

    const activateUser = async (id: string) => {
        try {
            const response = await api.user.activateUser(id);
            updateUserLocally(id, u => ({
                ...u,
                ...response.data
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke aktivere brugeren');
            fetchUsers();
        }
    };

    const deactivateUser = async (id: string) => {
        try {
            const response = await api.user.deactivateUser(id);
            updateUserLocally(id, u => ({
                ...u,
                ...response.data
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke deaktivere brugeren');
            fetchUsers();
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [paging.currentPage, paging.itemsPerPage, status, search, role, sort.orderBy, sort.sortBy]);

    return {
        users,
        loading,
        error,
        paging,
        setPaging,
        activateUser,
        deactivateUser,
        refresh: fetchUsers,
    };
}