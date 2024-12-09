import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Card, Text, Flex, Dialog, Heading, Button } from '@radix-ui/themes';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { transactionPagingAtom, useFetchTransactions, transactionSortAtom, sortTransactions, useToast } from '../import'; 
import TransactionCard from './TransactionCard';
import TransactionTable from './TransactionTable';
import TransactionFilters from './TransactionFilters';
import PageInfoDisplay from '../Pagination/PageInfoDisplay';
import PageSizeSelector from '../Pagination/PageSizeSelector';
import Pagination from '../Pagination/Pagination';
import AddCreditsForm from './AddCreditsForm';

interface TransactionListViewProps {
    isAdmin?: boolean;
}

export default function TransactionListView({ isAdmin = false }: TransactionListViewProps) {
    const [paging, setPaging] = useAtom(transactionPagingAtom);
    const [sort] = useAtom(transactionSortAtom);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    
    const {
        transactions,
        loading,
        error,
        acceptTransaction,
        denyTransaction,
    } = useFetchTransactions({ isAdmin });

    const sortedTransactions = useMemo(() =>
            loading ? [] : sortTransactions(transactions, sort.orderBy, sort.sortBy),
        [transactions, sort.orderBy, sort.sortBy, loading]
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
        if (transactions.length === 0) {
            return <Text align="center" className={className}>Ingen transaktioner fundet</Text>;
        }
        return null;
    };

    return (<>
        {/* Mobil/Tablet */}
        <Flex direction="column" gap="2" className="lg:hidden">
            {/* Tablet header */}
            <Flex className="hidden md:flex lg:hidden justify-between items-center mb-4">
                <Button variant="soft" onClick={() => setShowFilterDialog(true)}>
                    <MixerHorizontalIcon />
                    <Text as="span">Filtre</Text>
                </Button>

                <PageSizeSelector pageSize={paging.itemsPerPage} 
                                  onPageSizeChange={(size) => setPaging(prev => ({...prev, itemsPerPage: size, currentPage: 1}))} />
            </Flex>

            {/* Mobil/Tablet indhold */}
            <Flex direction="column" gap="2">
                <ContentState className="p-4" />
                {!loading && transactions.length > 0 && (
                    sortedTransactions.map(transaction => (
                        <TransactionCard key={transaction.id} 
                                         transaction={transaction} 
                                         isAdmin={isAdmin} 
                                         onAccept={acceptTransaction} 
                                         onDeny={denyTransaction} />
                    ))
                )}
            </Flex>

            {/* Tablet pagination */}
            <Flex className="hidden md:flex lg:hidden justify-center mt-4">
                {paging.totalPages > 1 && (
                <Pagination currentPage={paging.currentPage} 
                            totalPages={paging.totalPages} 
                            onPageChange={(page) => setPaging(prev => ({...prev, currentPage: page}))} />
                )}
            </Flex>
        </Flex>

        {/* Desktop */}
        <Flex gap="4" className="w-full hidden lg:flex">
            <Flex direction="column" gap="4" className="w-80">
                {!isAdmin && (
                <Card>
                    <Flex direction="column" gap="4" p="4">
                        <Heading size="3">Tilføj Credits</Heading>
                        <AddCreditsForm />
                    </Flex>
                </Card>
                )}

                <TransactionFilters />
            </Flex>

            {/* Desktop indhold */}
            <Card className="flex-1">
                <Flex direction="column" gap="4" className="p-4">
                    {!loading && transactions.length > 0 && (
                    <Flex justify="between" align="center" className="flex-wrap gap-2">
                        <PageInfoDisplay currentPage={paging.currentPage} pageSize={paging.itemsPerPage} totalItems={paging.totalItems} />
                        <PageSizeSelector pageSize={paging.itemsPerPage}
                                          onPageSizeChange={(size) => setPaging(prev => ({...prev, itemsPerPage: size, currentPage: 1}))} />
                    </Flex>
                    )}

                    <ContentState className="p-4" />
                    {!loading && transactions.length > 0 && (
                        <div className="w-full min-w-[600px] overflow-x-auto">
                            <TransactionTable transactions={sortedTransactions} 
                                              isAdmin={isAdmin} 
                                              onAccept={acceptTransaction} 
                                              onDeny={denyTransaction} />
                        </div>
                    )}

                    {paging.totalPages > 1 && !loading && transactions.length > 0 && (
                        <Pagination currentPage={paging.currentPage} 
                                    totalPages={paging.totalPages} 
                                    onPageChange={(page) => setPaging(prev => ({...prev, currentPage: page}))} />
                    )}
                </Flex>
            </Card>
        </Flex>

        {/* Tablet filter dialog */}
        <Dialog.Root open={showFilterDialog} onOpenChange={setShowFilterDialog}>
            <Dialog.Content className="fixed left-0 top-0 bottom-0 h-full max-w-[400px] translate-x-0 animate-in slide-in-from-left"
                            style={{ borderRadius: '0px' }}>
                <Flex direction="column" gap="4">
                    <VisuallyHidden.Root>
                        <Dialog.Title></Dialog.Title>
                    </VisuallyHidden.Root>
                    <Dialog.Description>{/* Er tom for at undgå aria warning */}</Dialog.Description>
                    <TransactionFilters />
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    </>);
}