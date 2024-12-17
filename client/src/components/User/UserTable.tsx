import React from 'react';
import { Table, Button, Badge } from '@radix-ui/themes';
import { format } from 'date-fns';
import { PlayIcon, StopIcon } from '@radix-ui/react-icons';
import { UserStatus, UserOrderBy, UserDetailsResponse } from '../import';
import UserTableHeader from './UserTableHeader';
import {da} from "date-fns/locale";

interface UserTableProps {
    users: UserDetailsResponse[];
    onActivate?: (id: string) => Promise<void>;
    onDeactivate?: (id: string) => Promise<void>;
}

const UserStatusBadge = ({ status }: { status: UserStatus }) => {
    const colors = {
        [UserStatus.Active]: 'green',
        [UserStatus.Inactive]: 'crimson',
    } as const;

    const statusText = {
        [UserStatus.Active]: 'Aktiv',
        [UserStatus.Inactive]: 'Inaktiv',
    };

    return (
        <Badge color={colors[status]} variant="soft">
            {statusText[status]}
        </Badge>
    );
};

export default function UserTable({ users, onActivate, onDeactivate }: UserTableProps) {
    return (
        <Table.Root variant="surface">
            <Table.Header>
                <Table.Row>
                    <UserTableHeader orderBy={UserOrderBy.Email}>
                        Email
                    </UserTableHeader>
                    <Table.ColumnHeaderCell>Tlf. nr.</Table.ColumnHeaderCell>
                    <UserTableHeader orderBy={UserOrderBy.Credits}>
                        Saldo
                    </UserTableHeader>
                    <UserTableHeader orderBy={UserOrderBy.Status}>
                        Status
                    </UserTableHeader>
                    <Table.ColumnHeaderCell>Roller</Table.ColumnHeaderCell>
                    <UserTableHeader orderBy={UserOrderBy.Timestamp}>
                        Oprettet
                    </UserTableHeader>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {users.map((user) => (
                    <Table.Row key={user.id}>
                        <Table.Cell>{user.email}</Table.Cell>
                        <Table.Cell>{user.phoneNumber || '-'}</Table.Cell>
                        <Table.Cell>{user.credits} kr</Table.Cell>
                        <Table.Cell>
                            <UserStatusBadge status={user.status} />
                        </Table.Cell>
                        <Table.Cell>
                            {user.roles.join(', ')}
                        </Table.Cell>
                        <Table.Cell>
                            {format(new Date(user.timestamp), 'd. MMMM yyyy HH:mm', { locale: da })}
                        </Table.Cell>
                        <Table.Cell>
                            {user.status === UserStatus.Inactive ? (
                                <Button onClick={() => onActivate?.(user.id)} color="green" variant="soft" size="1">
                                    <PlayIcon />
                                    Aktivér
                                </Button>
                            ) : (
                                <Button onClick={() => onDeactivate?.(user.id)} color="red" variant="soft" size="1">
                                    <StopIcon />
                                    Deaktivére
                                </Button>
                            )}
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}