import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Card, Text, Flex, Dialog, Button } from '@radix-ui/themes';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { userPagingAtom, useFetchUsers, userSortAtom, useToast } from '../import';
import UserTable from './UserTable';
import UserCard from './UserCard';
import UserFilters from './UserFilters';
import PageInfoDisplay from '../Pagination/PageInfoDisplay';
import PageSizeSelector from '../Pagination/PageSizeSelector';
import Pagination from '../Pagination/Pagination';

export default function UserListView() {
    const [paging, setPaging] = useAtom(userPagingAtom);
    const [sort] = useAtom(userSortAtom);
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    const {
        users,
        loading,
        error,
        activateUser,
        deactivateUser,
    } = useFetchUsers();

    const sortedUsers = useMemo(() =>
            loading ? [] : [...users].sort((a, b) => {
                const factor = sort.sortBy === 'Asc' ? 1 : -1;
                switch (sort.orderBy) {
                    case 'Email':
                        return factor * a.email.localeCompare(b.email);
                    case 'Credits':
                        return factor * (a.credits - b.credits);
                    case 'Status':
                        return factor * a.status.localeCompare(b.status);
                    case 'Timestamp':
                        return factor * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    default:
                        return 0;
                }
            }),
        [users, sort.orderBy, sort.sortBy, loading]
    );

    const ContentState = ({ className }: { className: string }) => {
        const { showToast } = useToast();

        useEffect(() => {
            if (error) {
                showToast("Fejl", error, "error");
            }
        }, [error]);

        if (loading) {
            return <Text align="center" className={className}>Indlæser...</Text>;
        }
        if (users.length === 0) {
            return <Text align="center" className={className}>Ingen brugere fundet</Text>;
        }
        return null;
    };

    return (
        <>
            {/* Mobile/Tablet */}
            <Flex direction="column" gap="2" className="lg:hidden">
                {/* Tablet header */}
                <Flex className="hidden md:flex lg:hidden justify-between items-center mb-4">
                    <Button variant="soft" onClick={() => setShowFilterDialog(true)}>
                        <MixerHorizontalIcon />
                        <Text as="span">Filtre</Text>
                    </Button>

                    <PageSizeSelector
                        pageSize={paging.itemsPerPage}
                        onPageSizeChange={(size) => setPaging(prev => ({...prev, itemsPerPage: size, currentPage: 1}))}
                    />
                </Flex>

                {/* Mobile/Tablet content */}
                <Flex direction="column" gap="2">
                    <ContentState className="p-4" />
                    {!loading && users.length > 0 && (
                        sortedUsers.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onActivate={activateUser}
                                onDeactivate={deactivateUser}
                            />
                        ))
                    )}
                </Flex>

                {/* Tablet pagination */}
                <Flex className="hidden md:flex lg:hidden justify-center mt-4">
                    {paging.totalPages > 1 && (
                        <Pagination
                            currentPage={paging.currentPage}
                            totalPages={paging.totalPages}
                            onPageChange={(page) => setPaging(prev => ({...prev, currentPage: page}))}
                        />
                    )}
                </Flex>
            </Flex>

            {/* Desktop */}
            <Flex gap="4" className="w-full hidden lg:flex">
                <Flex direction="column" gap="4" className="w-80">
                    <UserFilters />
                </Flex>

                {/* Desktop content */}
                <Card className="flex-1">
                    <Flex direction="column" gap="4" className="p-4">
                        {!loading && users.length > 0 && (
                            <Flex justify="between" align="center" className="flex-wrap gap-2">
                                <PageInfoDisplay
                                    currentPage={paging.currentPage}
                                    pageSize={paging.itemsPerPage}
                                    totalItems={paging.totalItems}
                                />
                                <PageSizeSelector
                                    pageSize={paging.itemsPerPage}
                                    onPageSizeChange={(size) => setPaging(prev => ({...prev, itemsPerPage: size, currentPage: 1}))}
                                />
                            </Flex>
                        )}

                        <ContentState className="p-4" />
                        {!loading && users.length > 0 && (
                            <div className="w-full min-w-[600px] overflow-x-auto">
                                <UserTable
                                    users={sortedUsers}
                                    onActivate={activateUser}
                                    onDeactivate={deactivateUser}
                                />
                            </div>
                        )}

                        {paging.totalPages > 1 && !loading && users.length > 0 && (
                            <Pagination
                                currentPage={paging.currentPage}
                                totalPages={paging.totalPages}
                                onPageChange={(page) => setPaging(prev => ({...prev, currentPage: page}))}
                            />
                        )}
                    </Flex>
                </Card>
            </Flex>

            {/* Tablet filter dialog */}
            <Dialog.Root open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                <Dialog.Content
                    className="fixed left-0 top-0 bottom-0 h-full max-w-[400px] translate-x-0 animate-in slide-in-from-left"
                    style={{ borderRadius: '0px' }}
                >
                    <Flex direction="column" gap="4">
                        <VisuallyHidden.Root>
                            <Dialog.Title></Dialog.Title>
                        </VisuallyHidden.Root>
                        <Dialog.Description>{/* Empty to avoid aria warning */}</Dialog.Description>
                        <UserFilters />
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
}