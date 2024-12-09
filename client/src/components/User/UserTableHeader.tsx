import { useAtom } from 'jotai';
import { Table, Flex } from '@radix-ui/themes';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import { UserOrderBy, SortOrder, userSortAtom } from '../import';

interface SortableColumnHeaderProps {
    children: React.ReactNode;
    orderBy: UserOrderBy;
}

export default function UserTableHeader({ children, orderBy }: SortableColumnHeaderProps) {
    const [sort, setSort] = useAtom(userSortAtom);
    const isActive = sort.orderBy === orderBy;

    const handleClick = () => {
        if (isActive) {
            setSort({
                ...sort,
                sortBy: sort.sortBy === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc
            });
        } else {
            setSort({
                orderBy,
                sortBy: SortOrder.Desc
            });
        }
    };

    return (
        <Table.ColumnHeaderCell
            onClick={handleClick}
            className="cursor-pointer transition-colors hover:bg-gray-8 dark:hover:bg-gray-3"
        >
            <Flex align="center" gap="2">
                {children}
                {isActive && (
                    sort.sortBy === SortOrder.Asc ?
                        <ArrowUpIcon /> :
                        <ArrowDownIcon />
                )}
            </Flex>
        </Table.ColumnHeaderCell>
    );
}