import React from 'react';
import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { format } from 'date-fns';
import { TransactionStatus, TransactionDetailsResponse } from '../import';

interface TransactionCardProps {
    transaction: TransactionDetailsResponse;
    isAdmin?: boolean;
    onAccept?: (id: string) => void;
    onDeny?: (id: string) => void;
}

export default function TransactionCard({transaction, isAdmin = false, onAccept, onDeny}: TransactionCardProps) {
    const statusColors = {
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
        <Card className="p-4">
            <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                    <Text size="5" weight="bold">{transaction.credits} kr</Text>
                    <Text
                        size="2"
                        weight="medium"
                        style={{ color: `var(--${statusColors[transaction.status]}-9)` }}
                    >
                        {statusText[transaction.status]}
                    </Text>
                </Flex>

                <Flex direction="column" gap="1">
                    <Text size="2" color="gray">
                        {format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm')}
                    </Text>
                    <Text size="2" color="gray">
                        Nr: {transaction.mobilePayTransactionNumber}
                    </Text>
                </Flex>

                {isAdmin && transaction.status === TransactionStatus.Pending && (
                    <Flex gap="2" mt="2">
                        <Button
                            onClick={() => onAccept?.(transaction.id)}
                            color="green"
                            variant="soft"
                            className="w-full"
                        >
                            Godkend
                        </Button>
                        <Button
                            onClick={() => onDeny?.(transaction.id)}
                            color="red"
                            variant="soft"
                            className="w-full"
                        >
                            Afvis
                        </Button>
                    </Flex>
                )}
            </Flex>
        </Card>
    );
}