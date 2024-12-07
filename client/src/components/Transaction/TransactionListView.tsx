import React from 'react';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { Card, Text, Flex } from '@radix-ui/themes';
import { transactionPagingAtom, useFetchTransactions, transactionSortAtom, sortTransactions } from '../import'; 
import TransactionCard from './TransactionCard';
import TransactionTable from './TransactionTable';
import PageInfoDisplay from '../Pagination/PageInfoDisplay';
import PageSizeSelector from '../Pagination/PageSizeSelector';
import Pagination from '../Pagination/Pagination';

interface TransactionListViewProps {
    isAdmin?: boolean;
}

export default function TransactionListView({ isAdmin = false }: TransactionListViewProps) {
    const [paging, setPaging] = useAtom(transactionPagingAtom);
    const [sort] = useAtom(transactionSortAtom);

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

    if (error) {
        return (
            <Card className="w-full">
                <Text color="red" className="p-4">Fejl: {error}</Text>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card className="w-full">
                <Text align="center" className="p-4">Indlæser...</Text>
            </Card>
        );
    }

    if (transactions.length === 0) {
        return (
            <Card className="w-full">
                <Text align="center" className="p-4">Ingen transaktioner fundet</Text>
            </Card>
        );
    }

    return (<>
        {/* Mobil */}
        <Flex direction="column" gap="2" className="md:hidden">
            {sortedTransactions.map(transaction => (
                <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    isAdmin={isAdmin}
                    onAccept={acceptTransaction}
                    onDeny={denyTransaction}
                />
            ))}
        </Flex>

        {/* Desktop/Tablet */}
        <Card className="w-full hidden md:block">
            <Flex direction="column" gap="4" className="p-4">
                <Flex justify="between" align="center" className="flex-wrap gap-2">
                    <PageInfoDisplay currentPage={paging.currentPage} pageSize={paging.itemsPerPage} totalItems={paging.totalItems} />
                    <PageSizeSelector pageSize={paging.itemsPerPage}
                                      onPageSizeChange={(size) => setPaging(prev => ({...prev, itemsPerPage: size, currentPage: 1}))} />
                </Flex>

                <div className="w-full min-w-[600px] overflow-x-auto">
                    <TransactionTable transactions={sortedTransactions} isAdmin={isAdmin} onAccept={acceptTransaction} onDeny={denyTransaction} />
                </div>

                <Pagination currentPage={paging.currentPage} 
                            totalPages={paging.totalPages} 
                            onPageChange={(page) => setPaging(prev => ({...prev, currentPage: page}))} />
            </Flex>
        </Card>
    </>);
}