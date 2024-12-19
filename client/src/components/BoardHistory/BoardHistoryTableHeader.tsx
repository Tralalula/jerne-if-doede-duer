import { useAtom } from 'jotai';
import { Table, Flex } from '@radix-ui/themes';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import { SortOrder, boardHistorySortAtom } from '../import';

interface SortableColumnHeaderProps {
    children: React.ReactNode;
}

export default function BoardHistoryTableHeader({ children }: SortableColumnHeaderProps) {
    const [sort, setSort] = useAtom(boardHistorySortAtom);

    const handleClick = () => {
        setSort({
            sortBy: sort.sortBy === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc
        });
    };

    return (
        <Table.ColumnHeaderCell onClick={handleClick} className="cursor-pointer transition-colors hover:bg-gray-8 dark:hover:bg-gray-3">
            <Flex align="center" gap="2">
                {children}
                {sort.sortBy === SortOrder.Asc ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </Flex>
        </Table.ColumnHeaderCell>
    );
}