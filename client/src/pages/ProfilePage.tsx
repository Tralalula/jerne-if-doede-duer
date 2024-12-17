import React, { useState } from 'react';
import { Page, UpdateProfileForm, ChangeEmailForm, ChangePasswordForm } from './import';
import { Flex, Heading, Card } from '@radix-ui/themes';

export default function ProfilePage() {
    return (
        <Page>
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Heading size="6">Min Profil</Heading>
                </Flex>

                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Min Profil</Heading>
                </Flex>

                <Flex direction="column" gap="4" className="w-full">
                    <Card>
                        <Flex direction="column" gap="4" p="4">
                            <Heading size="3">Profiloplysninger</Heading>
                            <UpdateProfileForm />
                        </Flex>
                    </Card>

                    <Card>
                        <Flex direction="column" gap="4" p="4">
                            <Heading size="3">Skift Email</Heading>
                            <ChangeEmailForm />
                        </Flex>
                    </Card>

                    <Card>
                        <Flex direction="column" gap="4" p="4">
                            <Heading size="3">Skift Adgangskode</Heading>
                            <ChangePasswordForm />
                        </Flex>
                    </Card>
                </Flex>
            </Flex>
        </Page>
    );
}