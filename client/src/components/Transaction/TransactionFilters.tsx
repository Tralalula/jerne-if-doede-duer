import React from 'react';
import { useAtom } from 'jotai';
import { Card, Flex, Select, TextField, Button } from '@radix-ui/themes';
import {
    TransactionStatus, TransactionOrderBy, SortOrder,
    transactionSortAtom, transactionStatusFilterAtom, transactionDateRangeAtom, transactionCreditsRangeAtom,
} from '../import';

export default function TransactionFilters() {
    const [sort, setSort] = useAtom(transactionSortAtom);
    const [status, setStatus] = useAtom(transactionStatusFilterAtom);
    const [dateRange, setDateRange] = useAtom(transactionDateRangeAtom);
    const [creditsRange, setCreditsRange] = useAtom(transactionCreditsRangeAtom);

    const handleReset = () => {
        setSort({
            orderBy: TransactionOrderBy.Timestamp,
            sortBy: SortOrder.Desc,
        });
        setStatus(null);
        setDateRange({ fromDate: null, toDate: null });
        setCreditsRange({ minCredits: null, maxCredits: null });
    };

    return (
        <Card className="p-4">
            <Flex direction="column" gap="3">
                <Flex gap="3" wrap="wrap">
                    <Select.Root
                        value={status ?? 'all'}
                        onValueChange={(value) => setStatus(value === 'all' ? null : value as TransactionStatus)}
                    >
                        <Select.Trigger />
                        <Select.Content>
                            <Select.Item value="all">Alle Status</Select.Item>
                            <Select.Item value={TransactionStatus.Pending}>Afventer</Select.Item>
                            <Select.Item value={TransactionStatus.Accepted}>Godkendt</Select.Item>
                            <Select.Item value={TransactionStatus.Denied}>Afvist</Select.Item>
                        </Select.Content>
                    </Select.Root>

                    <Select.Root
                        value={sort.orderBy}
                        onValueChange={(value) => setSort({ ...sort, orderBy: value as TransactionOrderBy })}
                    >
                        <Select.Trigger />
                        <Select.Content>
                            <Select.Item value={TransactionOrderBy.Timestamp}>Dato</Select.Item>
                            <Select.Item value={TransactionOrderBy.Credits}>Beløb</Select.Item>
                            <Select.Item value={TransactionOrderBy.Status}>Status</Select.Item>
                        </Select.Content>
                    </Select.Root>

                    <Select.Root
                        value={sort.sortBy}
                        onValueChange={(value) => setSort({ ...sort, sortBy: value as SortOrder })}
                    >
                        <Select.Trigger />
                        <Select.Content>
                            <Select.Item value={SortOrder.Asc}>Stigende</Select.Item>
                            <Select.Item value={SortOrder.Desc}>Faldende</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex gap="3" wrap="wrap">
                    <TextField.Root
                        type="date"
                        placeholder="Fra dato"
                        value={dateRange.fromDate ?? ''}
                        onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value || null })}
                    />

                    <TextField.Root
                        type="date"
                        placeholder="Til dato"
                        value={dateRange.toDate ?? ''}
                        onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value || null })}
                    />
                </Flex>

                <Flex gap="3" wrap="wrap">
                    <TextField.Root
                        type="number"
                        placeholder="Minimum credits"
                        value={creditsRange.minCredits ?? ''}
                        onChange={(e) => setCreditsRange({
                            ...creditsRange,
                            minCredits: e.target.value ? parseInt(e.target.value) : null
                        })}
                    />

                    <TextField.Root
                        type="number"
                        placeholder="Maximum credits"
                        value={creditsRange.maxCredits ?? ''}
                        onChange={(e) => setCreditsRange({
                            ...creditsRange,
                            maxCredits: e.target.value ? parseInt(e.target.value) : null
                        })}
                    />
                </Flex>

                <Button onClick={handleReset} variant="soft">
                    Nulstil filtre
                </Button>
            </Flex>
        </Card>
    );
}