import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { CheckCircledIcon, ClockIcon, Component1Icon, LayersIcon, MixerHorizontalIcon, PersonIcon, RowsIcon } from '@radix-ui/react-icons';
import { Card, Text, Flex, Dialog, Button } from '@radix-ui/themes';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { gameBoardHistorySortAtom, gameBoardHistoryPagingAtom, useToast, SortOrder, useFetchGameHistory, useFetchGameBoardHistory } from '../import';
import GameHistoryTable from './GameBoardHistoryTable';
import GameBoardHistoryCard from './GameBoardHistoryCard';
import GameBoardHistoryFilters from './GameBoardHistoryFilters';
import PageInfoDisplay from '../Pagination/PageInfoDisplay';
import PageSizeSelector from '../Pagination/PageSizeSelector';
import Pagination from '../Pagination/Pagination';

export default function GameBoardHistoryListView() {
    const [paging, setPaging] = useAtom(gameBoardHistoryPagingAtom);
    const [sort] = useAtom(gameBoardHistorySortAtom);
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    const {
        entry,
        loading,
        error,
    } = useFetchGameBoardHistory();

    const sortedEntries = useMemo(() => {
        if (loading) return [];
    
        const boards = entry?.boards?.boards ?? [];
        return [...boards].sort((a, b) => {
            const factor = sort.sortBy === SortOrder.Asc ? -1 : 1;
            return factor * (new Date(b.placedOn).getTime() - new Date(a.placedOn).getTime());
        });
    }, [entry, sort.sortBy, loading]);
    

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
        if (entry === null) {
            return <Text align="center" className={className}>Ingen spil fundet</Text>;
        }
        return null;
    };

    return (
        <>
            {/* Mobil/tablet */}
            <Flex direction="column" gap="2" className="lg:hidden">
                {/* Tablet header */}
                <Flex className="hidden md:flex lg:hidden justify-between items-center mb-4">
                    <Button variant="soft" onClick={() => setShowFilterDialog(true)}>
                        <MixerHorizontalIcon />
                        <Text as="span">Filtre</Text>
                    </Button>

                    <PageSizeSelector pageSize={paging.itemsPerPage} 
                                      onPageSizeChange={(size) => setPaging(prev => ({...prev, itemsPerPage: size, currentPage: 1}))}
                    />
                </Flex>

                {/* Mobil/Tablet indhold */}
                <Flex direction="column" gap="2">
                    <ContentState className="p-4" />
                    {!loading && entry?.boards?.boards && entry.boards.boards.length > 0 ? (
                        sortedEntries.map((entry) => (
                            <GameBoardHistoryCard key={entry.boardId} entry={entry} />
                        ))
                    ) : (
                        <Card className='flex items-center justify-center'>
                            <Text>
                                Ingen bræt fundet.
                            </Text>
                        </Card>
                    )}
                </Flex>

                {/* Tablet pagination */}
                <Flex className="hidden md:flex lg:hidden justify-center mt-4">
                    {paging.totalPages > 1 && (
                        <Pagination currentPage={paging.currentPage} 
                                    totalPages={paging.totalPages} 
                                    onPageChange={(page) => setPaging(prev => ({...prev, currentPage: page}))}
                        />
                    )}
                </Flex>
            </Flex>

            {/* Desktop */}
            
            <div className="hidden lg:block">
                <Flex gap="4">
                    <Card className="p-4 flex-1 bg-whiteA5 dark:bg-gray1/75 shadow-md">
                        <Flex align="center" justify="between">
                            <Flex align="center" gap="4">
                                <Component1Icon className="text-green-600" width={36} height={36} />
                                <div>
                                    <Text size="3" weight="medium" className="text-gray-600 dark:text-gray-300">
                                        Uge
                                    </Text>
                                </div>
                            </Flex>
                            <Text size="7" weight="bold" color="green" className="text-right">
                                {entry?.week}
                            </Text>
                        </Flex>
                    </Card>
    
                    <Card className="p-4 flex-1 bg-whiteA5 dark:bg-gray1/75 shadow-md">
                        <Flex align="center" justify="between">
                            <Flex align="center" gap="4">
                                <PersonIcon className="text-blue-500/75" width={36} height={36} />
                                <div>
                                    <Text size="3" weight="medium" className="text-gray-600 dark:text-gray-300">
                                        Deltagere
                                    </Text>
                                </div>
                            </Flex>
                            <Text size="7" weight="bold" className="text-right text-blue-500/75">
                                {entry?.entries}
                            </Text>
                        </Flex>
                    </Card>

                    <Card className="p-4 flex-1 bg-whiteA5 dark:bg-gray1/75 shadow-md">
                        <Flex align="center" justify="between">
                            <Flex align="center" gap="4">
                                <LayersIcon className="text-orange-500" width={36} height={36} />
                                <div>
                                    <Text size="3" weight="medium" className="text-gray-600 dark:text-gray-300">
                                        Pulje
                                    </Text>
                                </div>
                            </Flex>
                            <Text size="7" weight="bold" color="orange" className="text-right">
                                {entry?.totalPool},-
                            </Text>
                        </Flex>
                    </Card>
                    <Card className="p-4 flex-1 bg-whiteA5 dark:bg-gray1/75 shadow-md">
                        <Flex align="center" justify="between">
                            <Flex align="center" gap="4">
                                <RowsIcon className="text-red-500/75" width={36} height={36} />
                                <div>
                                    <Text size="3" weight="medium" className="text-gray-600 dark:text-gray-300">
                                        Total vundet
                                    </Text>
                                </div>
                            </Flex>
                            <Text size="7" weight="bold" className="text-right text-red-500/75">
                                {entry?.totalWinAmount},-
                            </Text>
                        </Flex>
                    </Card>
                </Flex>
            </div>
            <Flex gap="4" className="w-full hidden lg:flex">
                <Flex direction="column" gap="4" className="w-80">
                    <GameBoardHistoryFilters />
                </Flex>

                {/* Desktop indhold */}
                <Card className="flex-1">
                    <Flex direction="column" gap="4" className="p-4">
                        {!loading && entry?.boards?.boards && entry.boards.boards.length > 0 && (
                            <Flex justify="between" align="center" className="flex-wrap gap-2">
                                <PageInfoDisplay currentPage={paging.currentPage} 
                                                 pageSize={paging.itemsPerPage}
                                                 totalItems={paging.totalItems}
                                />
                                <PageSizeSelector pageSize={paging.itemsPerPage} 
                                                  onPageSizeChange={(size) => setPaging(prev => ({...prev, itemsPerPage: size, currentPage: 1}))}
                                />
                            </Flex>
                        )}

                        <ContentState className="p-4" />
                        {!loading && entry?.boards?.boards && entry.boards.boards.length > 0 ? (
                            <div className="w-full min-w-[600px] overflow-x-auto">
                                <GameHistoryTable entries={sortedEntries} activeGame={entry.active} />
                            </div>
                        ) : (
                            <Flex justify='center' align='center'>
                                Ingen bræt fundet.
                            </Flex>
                        )}

                        {paging.totalPages > 1 && !loading && entry?.boards?.boards && entry.boards.boards.length > 0 && (
                            <Pagination currentPage={paging.currentPage} 
                                        totalPages={paging.totalPages} 
                                        onPageChange={(page) => setPaging(prev => ({...prev, currentPage: page}))}
                            />
                        )}
                    </Flex>
                </Card>
            </Flex>

            {/* Tablet filter dialog */}
            <Dialog.Root open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                <Dialog.Content className="fixed left-0 top-0 bottom-0 h-full max-w-[400px] translate-x-0 animate-in slide-in-from-left" style={{ borderRadius: '0px' }}>
                    <Flex direction="column" gap="4">
                        <VisuallyHidden.Root>
                            <Dialog.Title></Dialog.Title>
                        </VisuallyHidden.Root>
                        <Dialog.Description>{/* Tom for at undgå aria warning */}</Dialog.Description>
                        <GameBoardHistoryFilters />
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
}