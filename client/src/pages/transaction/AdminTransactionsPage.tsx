import React from 'react';
import { Page,  } from '../import';
import { Flex, Heading } from '@radix-ui/themes';

export default function AdminTransactionsPage() {
    return (
        <Page>
            <Flex direction="column" gap="4" className="p-4 w-full max-w-6xl mx-auto">
                <Heading size="6">Administrer transaktioner</Heading>
            </Flex>
        </Page>
    );
}