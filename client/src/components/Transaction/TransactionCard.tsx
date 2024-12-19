import React, { useState, useEffect } from 'react';
import { Card, Flex, Text, Button, Link } from '@radix-ui/themes';
import { format } from 'date-fns';
import { TransactionStatus, TransactionDetailsResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes } from '../import';
import { da } from 'date-fns/locale';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

interface TransactionCardProps {
    transaction: TransactionDetailsResponse;
    isAdmin?: boolean;
    showUserEmail?: boolean;
    onAccept?: (id: string) => void;
    onDeny?: (id: string) => void;
}

export default function TransactionCard({ transaction, isAdmin = false, showUserEmail = false, onAccept, onDeny}: TransactionCardProps) {
    const [getUserDetails] = useAtom(getUserDetailsAtom);
    const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
    const [reviewerDetails, setReviewerDetails] = useState<UserDetailsResponse | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserDetails = async () => {
            const user = await getUserDetails(transaction.userId);
            if (user) {
                setUserDetails(user);
            }

            if (transaction.reviewedByUserId) {
                const reviewer = await getUserDetails(transaction.reviewedByUserId);
                if (reviewer) {
                    setReviewerDetails(reviewer);
                }
            }
        };

        if (showUserEmail) {
            loadUserDetails();
        }
    }, [transaction.userId, transaction.reviewedByUserId, getUserDetails, showUserEmail]);

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
                    <Text size="2" weight="medium" style={{ color: `var(--${statusColors[transaction.status]}-9)` }}>
                        {statusText[transaction.status]}
                    </Text>
                </Flex>

                {showUserEmail && (
                    <Text size="2" asChild>
                        {userDetails?.email ?? 'Ukendt bruger'}
                    </Text>
                )}

                <Flex justify="between" mt="auto">
                    <Text size="2" color="gray">
                        Nr: {transaction.mobilePayTransactionNumber}
                    </Text>
                    <Text size="2" color="gray">
                        {format(new Date(transaction.timestamp), 'd. MMMM yyyy HH:mm', { locale: da })}
                    </Text>
                </Flex>

                {showUserEmail && transaction.reviewedByUserId && (
                    <Flex gap="1" justify="end">
                        <Text size="2">{reviewerDetails?.email ?? 'Ukendt admin'}</Text>
                    </Flex>
                )}

                {isAdmin && transaction.status === TransactionStatus.Pending && (
                    <Flex gap="2" justify="end">
                        <Button onClick={() => onAccept?.(transaction.id)} color="green" variant="soft" size="1">
                            <CheckIcon />
                            Godkend
                        </Button>
                        <Button onClick={() => onDeny?.(transaction.id)} color="crimson" variant="soft" size="1">
                            <Cross2Icon />
                            Afvis
                        </Button>
                    </Flex>
                )}
            </Flex>
        </Card>
    );
}