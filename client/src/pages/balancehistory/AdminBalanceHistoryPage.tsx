import React from 'react';
import { Page, BalanceHistoryListView } from '../import';
import { Flex, Heading } from '@radix-ui/themes';

export default function AdminBalanceHistoryPage() {
    return (
        <Page>
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                {/* Mobil/tablet */}
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Heading size="6">Saldohistorik</Heading>
                </Flex>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Saldohistorik</Heading>
                </Flex>

                <BalanceHistoryListView isAdmin={true} showUserEmail={true} />
            </Flex>
        </Page>
    );
}