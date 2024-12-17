import React from 'react';
import { Card, Flex, Text, Button, Badge } from '@radix-ui/themes';
import { format } from 'date-fns';
import { PlayIcon, StopIcon } from '@radix-ui/react-icons';
import { UserStatus, UserDetailsResponse } from '../import';
import {da} from "date-fns/locale";

interface UserCardProps {
    user: UserDetailsResponse;
    onActivate?: (id: string) => Promise<void>;
    onDeactivate?: (id: string) => Promise<void>;
}

export default function UserCard({ user, onActivate, onDeactivate }: UserCardProps) {
    const statusColors = {
        [UserStatus.Active]: 'green',
        [UserStatus.Inactive]: 'crimson',
    } as const;

    const statusText = {
        [UserStatus.Active]: 'Aktiv',
        [UserStatus.Inactive]: 'Inaktiv',
    };

    return (
        <Card className="p-4">
            <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                    <Text size="5" weight="bold">{user.email}</Text>
                    <Badge color={statusColors[user.status]} variant="soft">
                        {statusText[user.status]}
                    </Badge>
                </Flex>

                <Flex justify="between">
                    <Text size="2" color="gray">Saldo: {user.credits} kr</Text>
                    <Text size="2" color="gray">
                        {format(new Date(user.timestamp), 'd. MMMM yyyy HH:mm', { locale: da })}
                    </Text>
                </Flex>

                {user.phoneNumber && (
                    <Text size="2" color="gray">
                        Tlf. nr.: {user.phoneNumber}
                    </Text>
                )}

                <Text size="2" color="gray">
                    Roller: {user.roles.join(', ')}
                </Text>

                <Flex justify="end" mt="2">
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
                </Flex>
            </Flex>
        </Card>
    );
}