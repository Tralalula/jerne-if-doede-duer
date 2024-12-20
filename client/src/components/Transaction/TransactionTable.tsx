import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Text, Badge, Flex, Link } from '@radix-ui/themes';
import { format } from 'date-fns';
import TransactionTableHeader from "./TransactionTableHeader";
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { TransactionStatus, TransactionOrderBy, TransactionDetailsResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes } from '../import';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

interface TransactionTableProps {
    isAdmin?: boolean;
    showUserEmail?: boolean;
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

export default function TransactionTable({ isAdmin = false, showUserEmail = false, transactions, onAccept, onDeny}: TransactionTableProps) {
    const [getUserDetails] = useAtom(getUserDetailsAtom);
    const [userDetails, setUserDetails] = useState<Map<string, UserDetailsResponse>>(new Map());
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserDetails = async () => {
            if (!showUserEmail) return;

            const newDetails = new Map();
            for (const transaction of transactions) {
                const user = await getUserDetails(transaction.userId);
                if (user) {
                    newDetails.set(transaction.userId, user);
                }

                if (transaction.reviewedByUserId) {
                    const reviewer = await getUserDetails(transaction.reviewedByUserId);
                    if (reviewer) {
                        newDetails.set(transaction.reviewedByUserId, reviewer);
                    }
                }
            }
            setUserDetails(newDetails);
        };

        loadUserDetails();
    }, [transactions, getUserDetails, showUserEmail]);

    return (
        <Table.Root variant="surface">
            <Table.Header>
                <Table.Row>
                    <TransactionTableHeader orderBy={TransactionOrderBy.Timestamp}>
                        Dato
                    </TransactionTableHeader>
                    {showUserEmail && (
                        <Table.ColumnHeaderCell>Bruger</Table.ColumnHeaderCell>
                    )}
                    <Table.ColumnHeaderCell>Transaktionsnummer</Table.ColumnHeaderCell>
                    <TransactionTableHeader orderBy={TransactionOrderBy.Credits}>
                        Credits
                    </TransactionTableHeader>
                    <TransactionTableHeader orderBy={TransactionOrderBy.Status}>
                        Status
                    </TransactionTableHeader>
                    {isAdmin && (
                        <Table.ColumnHeaderCell>Gennemgået af</Table.ColumnHeaderCell>
                    )}
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {transactions.map((transaction) => (
                    <Table.Row key={transaction.id}>
                        <Table.Cell>
                            {format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm')}
                        </Table.Cell>
                        {showUserEmail && (
                            <Table.Cell>
                                {userDetails.get(transaction.userId)?.email ?? 'Ukendt bruger'}
                            </Table.Cell>
                        )}
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
                            <Table.Cell>
                                {transaction.status === TransactionStatus.Pending ? (
                                    <Flex gap="2">
                                        <Button onClick={() => onAccept?.(transaction.id)} color="green" variant="soft" size="1">
                                            <CheckIcon />
                                            Godkend
                                        </Button>
                                        <Button onClick={() => onDeny?.(transaction.id)} color="crimson" variant="soft" size="1">
                                            <Cross2Icon />
                                            Afvis
                                        </Button>
                                    </Flex>
                                ) : (
                                    <Flex direction="column" gap="1">
                                        {userDetails.get(transaction.reviewedByUserId!)?.email ?? 'Ukendt admin'}
                                        <Text size="2" color="gray">
                                            {format(new Date(transaction.reviewedAt!), 'dd/MM/yyyy HH:mm')}
                                        </Text>
                                    </Flex>
                                )}
                            </Table.Cell>
                        )}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}