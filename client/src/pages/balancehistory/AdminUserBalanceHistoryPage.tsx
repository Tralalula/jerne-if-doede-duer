import React, { useEffect, useState } from 'react';
import { Page, BalanceHistoryListView, getUserDetailsAtom, UserDetailsResponse } from '../import';
import { Flex, Heading, Text } from '@radix-ui/themes';
import { useParams } from 'react-router-dom';
import { useAtom } from 'jotai';

export default function AdminUserBalanceHistoryPage() {
    const { userId } = useParams();
    const [getUserDetails] = useAtom(getUserDetailsAtom);
    const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);

    useEffect(() => {
        const loadUserDetails = async () => {
            if (userId) {
                const user = await getUserDetails(userId);
                setUserDetails(user);
            }
        };

        loadUserDetails();
    }, [userId, getUserDetails]);

    return (
        <Page>
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                {/* Mobil/tablet */}
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Flex direction="column" gap="2" align="center">
                        <Heading size="6">Saldohistorik</Heading>
                        {userDetails && (
                            <Text size="2" color="gray">{userDetails.email}</Text>
                        )}
                    </Flex>
                </Flex>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Flex direction="column" gap="2">
                        <Heading size="6">Saldohistorik</Heading>
                        {userDetails && (
                            <Text size="2" color="gray">{userDetails.email}</Text>
                        )}
                    </Flex>
                </Flex>

                <BalanceHistoryListView userId={userId} />
            </Flex>
        </Page>
    );
}
