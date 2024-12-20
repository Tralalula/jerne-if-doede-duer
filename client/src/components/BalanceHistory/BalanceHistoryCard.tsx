import React, {useEffect, useState} from 'react';
import { Card, Flex, Text, Badge, Link } from '@radix-ui/themes';
import { format } from 'date-fns';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes } from '../import';
import {useAtom} from "jotai/index";
import { da } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";

interface BalanceHistoryCardProps {
    entry: BalanceHistoryEntryResponse;
    showUserEmail?: boolean;
}

export default function BalanceHistoryCard({ entry, showUserEmail }: BalanceHistoryCardProps) {
    const [getUserDetails] = useAtom(getUserDetailsAtom);
    const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const loadUserDetails = async () => {
            const user = await getUserDetails(entry.userId);
            if (user) {
                setUserDetails(user);
            }
        };

        loadUserDetails();
    }, [entry.userId, getUserDetails]);
    
    const actionColors = {
        [BalanceAction.UserBought]: 'green',
        [BalanceAction.UserUsed]: 'red',
    } as const;

    const actionText = {
        [BalanceAction.UserBought]: 'Købt',
        [BalanceAction.UserUsed]: 'Brugt',
    };

    return (
        <Card className="p-4">
            <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                    <Badge color={actionColors[entry.action]} variant="soft">
                        {actionText[entry.action]}
                    </Badge>
                    <Text size="5" weight="bold" className={entry.action === BalanceAction.UserBought ? 'text-green-600' : 'text-red-600'}>
                        {entry.action === BalanceAction.UserBought ? '+' : '-'}{Math.abs(entry.amount)} kr
                    </Text>
                </Flex>

                {showUserEmail && (<Text size="2" asChild>
                    <Link onClick={() => navigate(AppRoutes.AdminUserBalanceHistory.replace(':userId', entry.userId))}
                          className="cursor-pointer"
                          color="blue"
                          underline="hover">
                        {userDetails?.email ?? 'Ukendt bruger'}
                    </Link>
                </Text>)}

                <Text size="2" color="gray">
                    {format(new Date(entry.timestamp), 'd. MMMM yyyy HH:mm', { locale: da })}
                </Text>
            </Flex>
        </Card>
    );
}