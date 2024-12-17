import { Text, Select, Flex } from '@radix-ui/themes';

interface PageSizeSelectorProps {
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

export default function PageSizeSelector({ pageSize, onPageSizeChange }: PageSizeSelectorProps) {
    return (
        <Flex align="center" gap="2">
            <Text size="2" weight="medium">Antal per side:</Text>
            <Select.Root value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
                <Select.Trigger />
                <Select.Content>
                    {[10, 25, 50, 100].map((size) => (
                        <Select.Item key={size} value={size.toString()}>
                            {size}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </Flex>
    );
}