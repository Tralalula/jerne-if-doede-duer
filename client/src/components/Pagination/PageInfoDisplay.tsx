import { Text } from '@radix-ui/themes';


interface PageInfoDisplayProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
}

export default function PageInfoDisplay({ currentPage, pageSize, totalItems }: PageInfoDisplayProps) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <Text size="2" weight="medium">
            {`Viser ${startItem} til ${endItem} af ${totalItems} i alt`}
        </Text>
    );
}