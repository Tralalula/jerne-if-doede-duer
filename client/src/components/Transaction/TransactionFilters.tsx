import React from 'react';
import { useAtom } from 'jotai';
import { Card, Flex, Select, Button, Heading, Text } from '@radix-ui/themes';
import {
    TransactionStatus,
    transactionStatusFilterAtom,
    transactionDateRangeAtom,
    transactionCreditsRangeAtom,
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
    },
    {
        label: 'Dette år',
        getValue: () => {
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);

            return {
                fromDate: getDateString(startOfYear),
                toDate: getDateString(today)
            };
        }
    }
];

const creditRanges = [
    { label: 'Alle', min: null, max: null },
    { label: '1-100 kr', min: 1, max: 100 },
    { label: '101-250 kr', min: 101, max: 250 },
    { label: '251-500 kr', min: 251, max: 500 },
    { label: '501-1000 kr', min: 501, max: 1000 },
    { label: 'Over 1000 kr', min: 1001, max: null }
];

export default function TransactionFilters() {
    const [status, setStatus] = useAtom(transactionStatusFilterAtom);
    const [dateRange, setDateRange] = useAtom(transactionDateRangeAtom);
    const [creditsRange, setCreditsRange] = useAtom(transactionCreditsRangeAtom);

    const handleDateRangeChange = (value: string) => {
        const range = dateRanges.find(r => r.label === value);
        if (range) {
            const newRange = range.getValue();
            setDateRange(newRange);
        }
    };

    const getCurrentDateRange = () => {
        if (!dateRange.fromDate && !dateRange.toDate) return 'Alle';

        return dateRanges.find(r => {
            const range = r.getValue();
            return range.fromDate === dateRange.fromDate && range.toDate === dateRange.toDate;
        })?.label || 'Tilpasset';
    };

    const getCurrentCreditRange = () => {
        if (!creditsRange.minCredits && !creditsRange.maxCredits) return 'Alle';
        return creditRanges.find(r =>
            r.min === creditsRange.minCredits && r.max === creditsRange.maxCredits
        )?.label || 'Tilpasset';
    };

    const handleReset = () => {
        setStatus(null);
        setDateRange({ fromDate: null, toDate: null });
        setCreditsRange({ minCredits: null, maxCredits: null });
    };

    return (
        <Card>
            <Flex direction="column" gap="4" p="4">
                <Heading size="3">Filtre</Heading>

                {/* Status filter */}
                <Flex direction="column" gap="2">
                    <Text as="label" size="2">Status</Text>
                    <Select.Root value={status ?? 'all'} onValueChange={(value) => setStatus(value === 'all' ? null : value as TransactionStatus)}>
                        <Select.Trigger placeholder="Vælg status" />
                        <Select.Content>
                            <Select.Item value="all">Alle</Select.Item>
                            <Select.Item value={TransactionStatus.Pending}>Afventer</Select.Item>
                            <Select.Item value={TransactionStatus.Accepted}>Godkendt</Select.Item>
                            <Select.Item value={TransactionStatus.Denied}>Afvist</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                {/* Dato filter */}
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

                {/* Beløb filter */}
                <Flex direction="column" gap="2">
                    <Text as="label" size="2">Beløbsinterval</Text>
                    <Select.Root value={getCurrentCreditRange()} 
                                 onValueChange={(value) => {
                                    const range = creditRanges.find(r => r.label === value);
                                    if (range) { setCreditsRange({minCredits: range.min, maxCredits: range.max}); }
                                 }}>
                        <Select.Trigger placeholder="Vælg beløbsinterval" />
                        <Select.Content>
                            {creditRanges.map(range => (
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