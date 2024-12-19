import { useAtom } from 'jotai';
import { Card, Flex, Select, Button, Heading, Text, Checkbox } from '@radix-ui/themes';
import {
    GameHistoryFilterAtom,
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

export default function GameBoardHistoryFilters() {
    const [filter, setFilter] = useAtom(GameHistoryFilterAtom);

    const handleDateRangeChange = (value: string) => {
        const range = dateRanges.find(r => r.label === value);
        if (range) {
            const newRange = range.getValue();
            setFilter(prev => ({ ...prev, ...newRange }));
        }
    };

    const handleWasWinChange = (value: boolean) => {
        setFilter(prev => ({ ...prev, wasWin: value }));
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
            fromDate: null,
            toDate: null,
        });
    };

    return (
        <Card>
            <Flex direction="column" gap="4" p="4">
                <Heading size="3">Filtre</Heading>
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