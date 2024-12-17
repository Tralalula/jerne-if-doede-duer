import React from 'react';
import { useState } from 'react';
import { Page, Balance, TransactionListView, AddCreditsDialog } from '../import';
import { Flex, Heading, Button } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';


export default function MyTransactionsPage() {
    const [showAddDialog, setShowAddDialog] = useState(false);
    
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

                {/* Mobil/Tablet */}
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Heading size="6">Transaktionshistorik</Heading>
                </Flex>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Transaktionshistorik</Heading>
                </Flex>

                <TransactionListView />
            </Flex>

            {/* Mobil/Tablet FAB */}
            <Button className="lg:hidden fixed right-4 shadow-lg z-30 rounded-full h-12 w-12 bottom-16 md:bottom-4" onClick={() => setShowAddDialog(true)}>
                <PlusIcon width={24} height={24} />
            </Button>

            <AddCreditsDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
        </Page>
    );
}