import React, {useState} from 'react';
import { Page, UserListView, RegisterUserDialog } from '../import';
import {Button, Flex, Heading} from '@radix-ui/themes';
import {PlusIcon} from "@radix-ui/react-icons";
import PickBox from '../../components/WinnerSequence/PickBox';

export default function WinnerSequence() {
    const [showAddDialog, setShowAddDialog] = useState(false);
    
    return (
        <Page justify='center'>
            <Flex className="p-4" gap="6" direction="column">
                {/* Desktop */}
                <Flex justify="center" className="w-full">
                    <Heading size="6">Vælg Vindersekvens</Heading>
                </Flex>

                <PickBox />
            </Flex>

            {/* Mobil/Tablet FAB */}
            <Button className="lg:hidden fixed right-4 shadow-lg z-30 rounded-full h-12 w-12 bottom-16 md:bottom-4" onClick={() => setShowAddDialog(true)}>
                <PlusIcon width={24} height={24} />
            </Button>

            <RegisterUserDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
        </Page>
    );
}