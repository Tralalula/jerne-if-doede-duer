import { useEffect, useState } from 'react';
import { Card, Text, Button, TextField, Flex, Heading } from '@radix-ui/themes';
import { api, balanceAtom } from '../import';
import { toast } from 'react-hot-toast';
import { useAtom } from 'jotai';

export default function Balance() {
    const [balance, setBalance] = useAtom(balanceAtom);
    const [loading, setLoading] = useState(false);
    const [mobilePayNumber, setMobilePayNumber] = useState('');
    const [credits, setCredits] = useState('');

    const fetchBalance = async () => {
        try {
            const response = await api.transaction.getBalance();
            setBalance(response.data);
        } catch (error) {
            toast.error('Kunne ikke hente saldo');
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const handlePurchase = async () => {
        if (!mobilePayNumber || !credits) {
            toast.error('Udfyld venligst alle felter');
            return;
        }

        setLoading(true);
        try {
            await api.transaction.createTransaction({
                credits: parseInt(credits),
                mobilePayTransactionNumber: mobilePayNumber,
            });
            toast.success('Transaktion indsendt til godkendelse');
            setMobilePayNumber('');
            setCredits('');
            fetchBalance();
        } catch (error) {
            toast.error('Kunne ikke oprette transaktion');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Card className="p-4">
            <Flex direction="column" gap="4">
                <Heading size="4">Saldo</Heading>

                <Flex gap="4">
                    <Card className="p-4">
                        <Text size="2">Nuværende Saldo</Text>
                        <Text size="6" weight="bold" color="green">
                            {balance?.currentBalance ?? 0} kr
                        </Text>
                    </Card>

                    <Card className="p-4">
                        <Text size="2">Afventende Credits</Text>
                        <Text size="6" weight="bold" color="orange">
                            {balance?.pendingCredits ?? 0} kr
                        </Text>
                    </Card>
                </Flex>

                <Card className="p-4">
                    <Flex direction="column" gap="3">
                        <Heading size="3">Køb Credits</Heading>
                        <Text>1 credit = 1 kr</Text>

                        <TextField.Root
                            placeholder="MobilePay transaktionsnummer"
                            value={mobilePayNumber}
                            onChange={(e) => setMobilePayNumber(e.target.value)}
                        />

                        <TextField.Root
                            type="number"
                            placeholder="Beløb i kr"
                            value={credits}
                            onChange={(e) => setCredits(e.target.value)}
                        />

                        <Button
                            disabled={loading || !mobilePayNumber || !credits}
                            onClick={handlePurchase}
                        >
                            {loading ? 'Behandler...' : 'Køb Credits'}
                        </Button>
                    </Flex>
                </Card>
            </Flex>
        </Card>
    );

}