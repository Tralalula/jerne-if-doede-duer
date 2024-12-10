import React, {useState} from 'react';
import { Page, UserListView, RegisterUserDialog } from '../import';
import {Button, Flex, Heading} from '@radix-ui/themes';
import {PlusIcon} from "@radix-ui/react-icons";

export default function AdminUsersPage() {
    const [showAddDialog, setShowAddDialog] = useState(false);
    
    return (
        <Page>
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                {/* Mobil/tablet */}
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Heading size="6">Brugeradministration</Heading>
                </Flex>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Brugeradministration</Heading>
                </Flex>

                <UserListView />
            </Flex>

            {/* Mobil/Tablet FAB */}
            <Button className="lg:hidden fixed right-4 shadow-lg z-30 rounded-full h-12 w-12 bottom-16 md:bottom-4" onClick={() => setShowAddDialog(true)}>
                <PlusIcon width={24} height={24} />
            </Button>

            <RegisterUserDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
        </Page>
    );
}