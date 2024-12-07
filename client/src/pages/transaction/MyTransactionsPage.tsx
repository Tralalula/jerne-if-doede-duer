import React from 'react';
import { Page, Balance, TransactionListView, TransactionFilters } from '../import';
import { Flex, Heading, Button, Text } from '@radix-ui/themes';
import { CheckCircledIcon, ClockIcon, PlusIcon } from '@radix-ui/react-icons';


export default function MyTransactionsPage() {
    return (
        <Page>
            {/* Mobile saldo */}
            <div className="md:hidden fixed top-0 left-0 z-30 w-full backdrop-blur-md bg-whiteA5 dark:bg-gray1/90 border-b dark:border-b-zinc-700">
                <Flex justify="between" align="center" className="px-4 py-2" style={{ paddingTop: 'var(--navbar-height)' }}>
                    <Flex align="center" gap="1">
                        <CheckCircledIcon className="text-green-600" width={16} height={16} />
                        <Flex align="baseline" gap="1">
                            <Text size="4" weight="bold" color="green">1500</Text>
                            <Text size="2" color="green">kr</Text>
                        </Flex>
                    </Flex>

                    <Flex align="center" gap="1">
                        <ClockIcon className="text-orange-500" width={16} height={16} />
                        <Flex align="baseline" gap="1">
                            <Text size="4" weight="bold" color="orange">300</Text>
                            <Text size="2" color="orange">kr</Text>
                        </Flex>
                    </Flex>
                </Flex>
            </div>

            {/* Indhold */}
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                <Flex justify={{ initial: 'center', md: 'start' }} className="w-full pt-6 md:pt-0">
                    <Heading size="6">Transaktionshistorik</Heading>
                </Flex>
                <TransactionListView />
            </Flex>

            {/* Mobil FAB */}
            <Button className="md:hidden fixed bottom-16 right-4 rounded-full h-12 w-12 shadow-lg z-30" 
                    onClick={() => {/* åben tilføj transaktion vindue */}}>
                <PlusIcon width={24} height={24} />
            </Button>
        </Page>
    );
}