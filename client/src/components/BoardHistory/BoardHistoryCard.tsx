import React, {useEffect, useState} from 'react';
import { Card, Flex, Text, Badge, Link } from '@radix-ui/themes';
import { format } from 'date-fns';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes, BoardHistoryResponse } from '../import';
import {useAtom} from "jotai/index";
import { da } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";

interface BoardHistoryCardProps {
    entry: BoardHistoryResponse;
    showUserEmail?: boolean;
}

export default function BoardHistoryCard({ entry, showUserEmail }: BoardHistoryCardProps) {
    const [getUserDetails] = useAtom(getUserDetailsAtom);
    const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
    const navigate = useNavigate();
    
    /*
    useEffect(() => {
        const loadUserDetails = async () => {
            const user = await getUserDetails(entry.userId);
            if (user) {
                setUserDetails(user);
            }
        };

        loadUserDetails();
    }, [entry.userId, getUserDetails]);*/
    
    const actionColors = {
        [BalanceAction.UserBought]: 'green',
        [BalanceAction.UserUsed]: 'red',
        [BalanceAction.AdminAssigned]: 'blue',
        [BalanceAction.AdminRevoked]: 'orange',
        [BalanceAction.WonPrize]: 'purple',
    } as const;

    const actionText = {
        [BalanceAction.UserBought]: 'Bruger købte',
        [BalanceAction.UserUsed]: 'Bruger brugte',
        [BalanceAction.AdminAssigned]: 'Admin tildelte',
        [BalanceAction.AdminRevoked]: 'Admin fratog',
        [BalanceAction.WonPrize]: 'Vandt præmie',
    };

    return (
        <Card className="p-4">
            <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                    <Badge variant="soft">
                        
                    </Badge>
                    <Text size="5" weight="bold">
                        {entry.configuration}
                    </Text>
                </Flex>

                <Text size="2" color="gray">
                    {format(new Date(entry.placedOn), 'd. MMMM yyyy HH:mm', { locale: da })}
                </Text>
            </Flex>
        </Card>
    );
}