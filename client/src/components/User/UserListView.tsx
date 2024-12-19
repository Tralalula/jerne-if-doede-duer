import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Card, Text, Flex, Dialog, Button, Heading } from '@radix-ui/themes';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { userPagingAtom, useFetchUsers, userSortAtom, useToast, UserDetailsResponse } from '../import';
import UserTable from './UserTable';
import UserCard from './UserCard';
import UserFilters from './UserFilters';
import PageInfoDisplay from '../Pagination/PageInfoDisplay';
import PageSizeSelector from '../Pagination/PageSizeSelector';
import Pagination from '../Pagination/Pagination';
import RegisterUserForm from './RegisterUserForm';
import UpdateUserDialog from './UpdateUserDialog';

export default function UserListView() {
    // Tilstandshåndtering
    const [paging, setPaging] = useAtom(userPagingAtom);
    const [sort] = useAtom(userSortAtom);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDetailsResponse | null>(null);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);

    // Hent brugerdata og funktioner
    const {
        users,
        loading,
        error,
        activateUser,
        deactivateUser,
    } = useFetchUsers();

    // Sorter brugere baseret på valgte kriterier
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

    // Indholdskomponent til visning af indlæsning/fejl tilstande
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

    // Håndter klik på brugerkort i mobil/tablet visning
    const handleCardClick = (user: UserDetailsResponse) => {
        setSelectedUser(user);
        setShowUpdateDialog(true);
    };

    return (
        <>
            {/* Mobil/Tablet visning */}
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

                {/* Mobil/Tablet indhold */}
                <Flex direction="column" gap="2">
                    <ContentState className="p-4" />
                    {!loading && users.length > 0 && (
                        sortedUsers.map(user => (
                            <div key={user.id} onClick={() => handleCardClick(user)}>
                                <UserCard
                                    user={user}
                                    onActivate={activateUser}
                                    onDeactivate={deactivateUser}
                                />
                            </div>
                        ))
                    )}
                </Flex>

                {/* Tablet paginering */}
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

            {/* Desktop visning */}
            <Flex gap="4" className="w-full hidden lg:flex">
                {/* Venstre sidebar */}
                <Flex direction="column" gap="4" className="w-80">
                    <Card>
                        <Flex direction="column" gap="4" p="4">
                            <Heading size="3">Opret bruger</Heading>
                            <RegisterUserForm />
                        </Flex>
                    </Card>

                    <UserFilters />
                </Flex>

                {/* Hovedindhold */}
                <Card className="flex-1">
                    <Flex direction="column" gap="4" className="p-4">
                        {/* Sideinfo og størrelsesvælger */}
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

                        {/* Brugertabel */}
                        {!loading && users.length > 0 && (
                            <div className="w-full min-w-[600px] overflow-x-auto">
                                <UserTable
                                    users={sortedUsers}
                                    onActivate={activateUser}
                                    onDeactivate={deactivateUser}
                                    onUserSelect={(user) => {
                                        setSelectedUser(user);
                                        setShowUpdateDialog(true);
                                    }}
                                />
                            </div>
                        )}

                        {/* Paginering */}
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

            {/* Filter dialog */}
            <Dialog.Root open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                <Dialog.Content
                    className="fixed left-0 top-0 bottom-0 h-full max-w-[400px] translate-x-0 animate-in slide-in-from-left"
                    style={{ borderRadius: '0px' }}
                >
                    <Flex direction="column" gap="4">
                        <VisuallyHidden.Root>
                            <Dialog.Title></Dialog.Title>
                        </VisuallyHidden.Root>
                        <Dialog.Description>{/* Tom for at undgå aria warning */}</Dialog.Description>
                        <UserFilters />
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>

            <UpdateUserDialog
                open={showUpdateDialog}
                onOpenChange={(open) => {
                    setShowUpdateDialog(open);
                    if (!open) setSelectedUser(null);
                }}
                user={selectedUser}
            />
        </>
    );
}