import React from 'react';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Link } from '@radix-ui/themes';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes } from '../import';
import BoardHistoryTableHeader from './BoardHistoryTableHeader';

interface BoardHistoryTableProps {
    entries: BalanceHistoryEntryResponse[];
    showUserEmail?: boolean;
}

export default function BoardHistoryTable({ entries, showUserEmail = false }: BoardHistoryTableProps) {
    const [getUserDetails] = useAtom(getUserDetailsAtom);
    const [userDetails, setUserDetails] = useState<Map<string, UserDetailsResponse>>(new Map());
    const navigate = useNavigate();
    
    useEffect(() => {
        const loadUserDetails = async () => {
            const newDetails = new Map();
            for (const entry of entries) {
                const user = await getUserDetails(entry.userId);
                if (user) {
                    newDetails.set(entry.userId, user);
                }
            }
            setUserDetails(newDetails);
        };

        loadUserDetails();
    }, [entries, getUserDetails]);

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
        <Table.Root variant="surface">
            <Table.Header>
                <Table.Row>
                    <BoardHistoryTableHeader>Dato</BoardHistoryTableHeader>
                    {showUserEmail && (
                        <Table.ColumnHeaderCell>Bruger</Table.ColumnHeaderCell>
                    )}
                    <Table.ColumnHeaderCell>Handling</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Beløb</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {entries.map((entry) => (
                    <Table.Row key={entry.id}>
                        <Table.Cell>
                            {format(new Date(entry.timestamp), 'd. MMMM yyyy HH:mm', { locale: da })}
                        </Table.Cell>
                        {showUserEmail && (<Table.Cell>
                            <Link onClick={() => navigate(AppRoutes.AdminUserBalanceHistory.replace(':userId', entry.userId))} 
                                  className="cursor-pointer" 
                                  color="blue" 
                                  underline="hover">
                                {userDetails.get(entry.userId)?.email ?? 'Ukendt bruger'}
                            </Link>
                        </Table.Cell> )}
                        <Table.Cell>
                            <Badge color={actionColors[entry.action]} variant="soft">
                                {actionText[entry.action]}
                            </Badge>
                        </Table.Cell>
                        <Table.Cell>
                            <span className={entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {entry.amount > 0 ? '+' : ''}{entry.amount} kr
                            </span>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}