import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Card, Text, Flex, Dialog, Button } from '@radix-ui/themes';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { balanceHistoryPagingAtom, useFetchBalanceHistory, balanceHistorySortAtom, useToast, SortOrder, useFetchBoardHistory } from '../import';
import BoardHistoryTable from './BoardHistoryTable';
import BoardHistoryCard from './BoardHistoryCard';
import BoardHistoryFilters from './BoardHistoryFilters';
import PageInfoDisplay from '../Pagination/PageInfoDisplay';
import PageSizeSelector from '../Pagination/PageSizeSelector';
import Pagination from '../Pagination/Pagination';

export default function BoardHistoryListView() {
    const [paging, setPaging] = useAtom(balanceHistoryPagingAtom);
    const [sort] = useAtom(balanceHistorySortAtom);
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    const {
        entries,
        loading,
        error,
    } = useFetchBoardHistory();

    const sortedEntries = useMemo(() =>
            loading ? [] : [...entries].sort((a, b) => {
                const factor = sort.sortBy === SortOrder.Asc ? -1 : 1;
                return factor * (new Date(b.placedOn).getTime() - new Date(a.placedOn).getTime());
            }),
        [entries, sort.sortBy, loading]
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
        if (entries.length === 0) {
            return <Text align="center" className={className}>Ingen historik fundet</Text>;
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
                    {!loading && entries.length > 0 && (
                        sortedEntries.map(entry => (
                            <BoardHistoryCard key={entry.boardId} entry={entry}/>
                        ))
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
            <Flex gap="4" className="w-full hidden lg:flex">
                <Flex direction="column" gap="4" className="w-80">
                    <BoardHistoryFilters />
                </Flex>

                {/* Desktop indhold */}
                <Card className="flex-1">
                    <Flex direction="column" gap="4" className="p-4">
                        {!loading && entries.length > 0 && (
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
                        {!loading && entries.length > 0 && (
                            <div className="w-full min-w-[600px] overflow-x-auto">
                                <BoardHistoryTable entries={sortedEntries} />
                            </div>
                        )}

                        {paging.totalPages > 1 && !loading && entries.length > 0 && (
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
                        <BoardHistoryFilters />
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
}