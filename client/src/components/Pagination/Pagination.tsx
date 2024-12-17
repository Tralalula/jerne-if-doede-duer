import { Button, Flex } from '@radix-ui/themes';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const handlePageClick = (page: number) => {
        onPageChange(page);
    };

    return (
        <Flex justify="center" align="center" mt="4" gap="1">
            {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                    <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'solid' : 'soft'}
                        onClick={() => handlePageClick(pageNumber)}
                    >
                        {pageNumber}
                    </Button>
                );
            })}
        </Flex>
    );
}