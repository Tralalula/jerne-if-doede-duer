import { useEffect } from 'react';
import { Card, Text, Flex } from '@radix-ui/themes';
import { api, balanceAtom, useToast } from '../import';
import { useAtom } from 'jotai';
import { CheckCircledIcon, ClockIcon } from '@radix-ui/react-icons';

export default function Balance() {
    const [balance, setBalance] = useAtom(balanceAtom);
    const { showToast } = useToast();

    const fetchBalance = async () => {
        try {
            const response = await api.transaction.getBalance();
            setBalance(response.data);
        } catch (error) {
            showToast('Fejl', 'Kunne ikke hente saldo', 'error');
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const MobileBalance = () => (
        <div className="md:hidden fixed top-0 left-0 z-30 w-full backdrop-blur-md bg-whiteA5 dark:bg-gray1/90 border-b dark:border-b-zinc-700">
            <Flex justify="between" align="center" className="px-4 py-2" style={{ paddingTop: 'var(--navbar-height)' }}>
                <Flex align="center" gap="1">
                    <CheckCircledIcon className="text-green-600" width={16} height={16} />
                    <Flex align="baseline" gap="1">
                        <Text size="4" weight="bold" color="green">{balance?.currentBalance ?? 0}</Text>
                        <Text size="2" color="green">kr</Text>
                    </Flex>
                </Flex>

                <Flex align="center" gap="1">
                    <ClockIcon className="text-orange-500" width={16} height={16} />
                    <Flex align="baseline" gap="1">
                        <Text size="4" weight="bold" color="orange">{balance?.pendingCredits ?? 0}</Text>
                        <Text size="2" color="orange">kr</Text>
                    </Flex>
                </Flex>
            </Flex>
        </div>
    );

    const TabletBalance = () => (
        <div className="hidden md:block lg:hidden mb-4">
            <Card className="w-full bg-whiteA5 dark:bg-gray1/75">
                <Flex justify="between" align="center" className="px-4 py-3">
                    <Flex direction="column" gap="1">
                        <Text size="2" weight="medium">Nuværende saldo</Text>
                        <Flex align="center" gap="2">
                            <CheckCircledIcon className="text-green-600" width={20} height={20} />
                            <Flex align="baseline" gap="1">
                                <Text size="6" weight="bold" color="green">{balance?.currentBalance ?? 0}</Text>
                                <Text size="2" color="green">kr</Text>
                            </Flex>
                        </Flex>
                    </Flex>

                    <Flex direction="column" gap="1" align="end">
                        <Text size="2" weight="medium">Afventende credits</Text>
                        <Flex align="center" gap="2">
                            <ClockIcon className="text-orange-500" width={20} height={20} />
                            <Flex align="baseline" gap="1">
                                <Text size="6" weight="bold" color="orange">{balance?.pendingCredits ?? 0}</Text>
                                <Text size="2" color="orange">kr</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
            </Card>
        </div>
    );

    const DesktopBalance = () => (
        <div className="hidden lg:block">
            <Flex gap="4">
                <Card className="p-4 flex-1 bg-whiteA5 dark:bg-gray1/75 shadow-md">
                    <Flex align="center" justify="between">
                        <Flex align="center" gap="4">
                            <CheckCircledIcon className="text-green-600" width={36} height={36} />
                            <div>
                                <Text size="3" weight="medium" className="text-gray-600 dark:text-gray-300">
                                    Nuværende saldo
                                </Text>
                            </div>
                        </Flex>
                        <Text size="7" weight="bold" color="green" className="text-right">
                            {balance?.currentBalance ?? 0} kr
                        </Text>
                    </Flex>
                </Card>

                <Card className="p-4 flex-1 bg-whiteA5 dark:bg-gray1/75 shadow-md">
                    <Flex align="center" justify="between">
                        <Flex align="center" gap="4">
                            <ClockIcon className="text-orange-500" width={36} height={36} />
                            <div>
                                <Text size="3" weight="medium" className="text-gray-600 dark:text-gray-300">
                                    Afventende credits
                                </Text>
                            </div>
                        </Flex>
                        <Text size="7" weight="bold" color="orange" className="text-right">
                            {balance?.pendingCredits ?? 0} kr
                        </Text>
                    </Flex>
                </Card>
            </Flex>
        </div>
    );

    return (
        <>
            <MobileBalance />
            <TabletBalance />
            <DesktopBalance />
        </>
    );
}