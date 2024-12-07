import React from 'react';
import { Table, Button, Card, Text, Badge, Flex } from '@radix-ui/themes';
import { format } from 'date-fns'
import TransactionTableHeader from "./TransactionTableHeader";
import { transactionPagingAtom, useFetchTransactions, TransactionStatus, TransactionOrderBy, sortTransactions, transactionSortAtom, TransactionDetailsResponse } from '../import';


interface TransactionTableProps {
    isAdmin?: boolean;
    transactions: TransactionDetailsResponse[];
    onAccept?: (id: string) => Promise<void>;
    onDeny?: (id: string) => Promise<void>;
}

const TransactionStatusBadge = ({ status }: { status: TransactionStatus }) => {
    const colors = {
        [TransactionStatus.Pending]: 'orange', 
        [TransactionStatus.Accepted]: 'green', 
        [TransactionStatus.Denied]: 'crimson',
    } as const;  

    const statusText = {
        [TransactionStatus.Pending]: 'Afventer',
        [TransactionStatus.Accepted]: 'Godkendt',
        [TransactionStatus.Denied]: 'Afvist',
    };

    return (
        <Badge color={colors[status]} variant="soft">
            {statusText[status]}
        </Badge>
    );
};

export default function TransactionTable({ isAdmin = false, transactions, onAccept, onDeny  }: TransactionTableProps) {
    return (
        <Table.Root variant="surface">
            <Table.Header>
                <Table.Row>
                    <TransactionTableHeader orderBy={TransactionOrderBy.Timestamp}>
                        Dato
                    </TransactionTableHeader>
                    <Table.ColumnHeaderCell>Transaktionsnummer</Table.ColumnHeaderCell>
                    <TransactionTableHeader orderBy={TransactionOrderBy.Credits}>
                        Credits
                    </TransactionTableHeader>
                    <TransactionTableHeader orderBy={TransactionOrderBy.Status}>
                        Status
                    </TransactionTableHeader>
                    {isAdmin && (
                        <>
                            <Table.ColumnHeaderCell>Gennemgået af</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Handlinger</Table.ColumnHeaderCell>
                        </>
                    )}
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {transactions.map((transaction) => (
                    <Table.Row key={transaction.id}>
                        <Table.Cell>
                            {format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm')}
                        </Table.Cell>
                        <Table.Cell>
                            {transaction.mobilePayTransactionNumber}
                        </Table.Cell>
                        <Table.Cell>
                            {transaction.credits} kr
                        </Table.Cell>
                        <Table.Cell>
                            <TransactionStatusBadge status={transaction.status} />
                        </Table.Cell>
                        {isAdmin && (
                            <>
                                <Table.Cell>
                                    {transaction.reviewedByUserId ? (
                                        <Text size="2">
                                            {format(new Date(transaction.reviewedAt!), 'dd/MM/yyyy HH:mm')}
                                        </Text>
                                    ) : '-'}
                                </Table.Cell>
                                <Table.Cell>
                                    {transaction.status === TransactionStatus.Pending && (
                                        <Flex gap="2">
                                            <Button
                                                onClick={() => onAccept?.(transaction.id)}
                                                color="green"
                                            >
                                                Godkend
                                            </Button>
                                            <Button
                                                onClick={() => onDeny?.(transaction.id)}
                                                color="red"
                                            >
                                                Afvis
                                            </Button>
                                        </Flex>
                                    )}
                                </Table.Cell>
                            </>
                        )}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}