import React from 'react';
import { Page, UserListView } from '../import';
import { Flex, Heading } from '@radix-ui/themes';

export default function AdminUsersPage() {
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
        </Page>
    );
}