import React from 'react';
import { Page, Balance, BalanceHistoryListView } from '../import';
import { Flex, Heading } from '@radix-ui/themes';

export default function MyBalanceHistoryPage() {
    return (
        <Page>
            <div className="md:hidden">
                <Balance />
            </div>

            {/* Indhold */}
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                <div className="hidden md:block">
                    <Balance />
                </div>

                {/* Mobil/tablet */}
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Heading size="6">Saldohistorik</Heading>
                </Flex>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Saldohistorik</Heading>
                </Flex>

                <BalanceHistoryListView />
            </Flex>
        </Page>
    );
}