import React from 'react';
import { useAtom } from 'jotai';
import { Card, Flex, Select, Button, Heading, Text } from '@radix-ui/themes';
import {
    BalanceAction,
    balanceHistoryFilterAtom,
} from '../import';

const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const dateRanges = [
    {
        label: 'Alle',
        getValue: () => ({ fromDate: null, toDate: null })
    },
    {
        label: 'I dag',
        getValue: () => {
            const today = getDateString(new Date());
            return { fromDate: today, toDate: today };
        }
    },
    {
        label: 'Denne uge',
        getValue: () => {
            const today = new Date();
            const startOfWeek = new Date(today);

            const dayOfWeek = today.getDay();
            const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startOfWeek.setDate(today.getDate() - daysSinceMonday);

            return {
                fromDate: getDateString(startOfWeek),
                toDate: getDateString(today)
            };
        }
    },
    {
        label: 'Denne måned',
        getValue: () => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            return {
                fromDate: getDateString(startOfMonth),
                toDate: getDateString(today)
            };
        }
    }
];

export default function BalanceHistoryFilters() {
    const [filter, setFilter] = useAtom(balanceHistoryFilterAtom);

    const handleDateRangeChange = (value: string) => {
        const range = dateRanges.find(r => r.label === value);
        if (range) {
            const newRange = range.getValue();
            setFilter(prev => ({ ...prev, ...newRange }));
        }
    };

    const getCurrentDateRange = () => {
        if (!filter.fromDate && !filter.toDate) return 'Alle';

        return dateRanges.find(r => {
            const range = r.getValue();
            return range.fromDate === filter.fromDate && range.toDate === filter.toDate;
        })?.label || 'Tilpasset';
    };

    const handleReset = () => {
        setFilter({
            action: null,
            fromDate: null,
            toDate: null,
        });
    };

    const actionText = {
        [BalanceAction.UserBought]: 'Bruger købte',
        [BalanceAction.UserUsed]: 'Bruger brugte',
        [BalanceAction.AdminAssigned]: 'Admin tildelte',
        [BalanceAction.AdminRevoked]: 'Admin fratog',
        [BalanceAction.WonPrize]: 'Vandt præmie',
    };

    return (
        <Card>
            <Flex direction="column" gap="4" p="4">
                <Heading size="3">Filtre</Heading>

                <Flex direction="column" gap="2">
                    <Text as="label" size="2">Handling</Text>
                    <Select.Root
                        value={filter.action ?? 'all'}
                        onValueChange={(value) => setFilter(prev => ({
                            ...prev,
                            action: value === 'all' ? null : value as BalanceAction
                        }))}
                    >
                        <Select.Trigger placeholder="Vælg handling" />
                        <Select.Content>
                            <Select.Item value="all">Alle</Select.Item>
                            {Object.values(BalanceAction).map(action => (
                                <Select.Item key={action} value={action}>
                                    {actionText[action]}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                    <Text as="label" size="2">Datointerval</Text>
                    <Select.Root value={getCurrentDateRange()} onValueChange={handleDateRangeChange}>
                        <Select.Trigger placeholder="Vælg datointerval" />
                        <Select.Content>
                            {dateRanges.map(range => (
                                <Select.Item key={range.label} value={range.label}>
                                    {range.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Button onClick={handleReset} variant="soft" color="gray">
                    Nulstil filtre
                </Button>
            </Flex>
        </Card>
    );
}