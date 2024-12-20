import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Card, Flex, Select, Button, Heading, Text, TextField } from '@radix-ui/themes';
import {
    UserStatus,
    RoleType,
    userStatusFilterAtom,
    userRoleFilterAtom,
    userSearchAtom,
    useDebounce
} from '../import';

export default function UserFilters() {
    const [status, setStatus] = useAtom(userStatusFilterAtom);
    const [role, setRole] = useAtom(userRoleFilterAtom);
    const [search, setSearch] = useAtom(userSearchAtom);

    const [inputValue, setInputValue] = useState(search || '');

    const debounceSearch = useDebounce((searchTerm: string) => {
        setSearch(searchTerm || null);
    }, 500);

    useEffect(() => {
        debounceSearch(inputValue);
    }, [inputValue]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    const handleReset = () => {
        setStatus(null);
        setRole(null);
        setSearch(null);
        setInputValue('');
    };

    return (
        <Card>
            <Flex direction="column" gap="4" p="4">
                <Heading size="3">Filtre</Heading>

                <Flex direction="column" gap="2">
                    <Text as="label" size="2">Søg</Text>
                    <TextField.Root
                        variant="soft"
                        color="gray"
                        placeholder="Søg efter email eller tlf. nr."
                        value={inputValue}
                        onChange={handleSearchChange}
                    />
                </Flex>

                <Flex direction="column" gap="2">
                    <Text as="label" size="2">Status</Text>
                    <Select.Root
                        value={status ?? 'all'}
                        onValueChange={(value) => setStatus(value === 'all' ? null : value as UserStatus)}
                    >
                        <Select.Trigger placeholder="Vælg status" />
                        <Select.Content>
                            <Select.Item value="all">Alle</Select.Item>
                            <Select.Item value={UserStatus.Active}>Aktiv</Select.Item>
                            <Select.Item value={UserStatus.Inactive}>Inaktiv</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                    <Text as="label" size="2">Rolle</Text>
                    <Select.Root
                        value={role ?? 'all'}
                        onValueChange={(value) => setRole(value === 'all' ? null : value as RoleType)}
                    >
                        <Select.Trigger placeholder="Vælg rolle" />
                        <Select.Content>
                            <Select.Item value="all">Alle</Select.Item>
                            <Select.Item value={RoleType.Admin}>Admin</Select.Item>
                            <Select.Item value={RoleType.Player}>Spiller</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Button onClick={handleReset} variant="soft" color="gray" className="cursor-pointer">
                    Nulstil filtre
                </Button>
            </Flex>
        </Card>
    );
}