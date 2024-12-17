import React from 'react';
import { Flex, Button } from '@radix-ui/themes';

interface FormContainerProps {
    children: React.ReactNode;
    onReset: () => void;
    isSubmitting: boolean;
    submitLabel?: string;
}

export default function FormContainer({ children, onReset, isSubmitting, submitLabel = 'Gem' }: FormContainerProps) {
    const handleReset = (e: React.MouseEvent) => {
        e.preventDefault();
        onReset();
    };

    return (
        <Flex direction="column" gap="4">
            {children}
            <Flex gap="3" mt="4" justify="end">
                <Button
                    type="button"
                    variant="soft"
                    color="gray"
                    onClick={handleReset}
                    disabled={isSubmitting}
                >
                    Annuller
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Gemmer...' : submitLabel}
                </Button>
            </Flex>
        </Flex>
    );
}