import React from 'react';
import { Text, Card, Flex } from "@radix-ui/themes";
import { Page } from "../components";

export default function GameRules() {
    return (
        <Page align="center" justify="center">
            <Flex direction="column" className="max-w-2xl mx-auto py-8">
                <Text size="8" weight="bold" className="text-center mb-4">
                    Døde Duer - Spilleregler
                </Text>

                <Card className="p-6">
                    <Flex direction="column" gap="6">
                        <Flex direction="column" gap="1">
                            <Text weight="bold">Spillet kort</Text>
                            <Text size="2" color="gray">
                                Vælg 5-8 numre mellem 1-16. Der trækkes 3 vindernumre hver uge.
                            </Text>
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text weight="bold">Priser</Text>
                            <Flex direction="column" gap="1">
                                <Text size="2" color="gray">5 numre: 20 kr</Text>
                                <Text size="2" color="gray">6 numre: 40 kr</Text>
                                <Text size="2" color="gray">7 numre: 80 kr</Text>
                                <Text size="2" color="gray">8 numre: 160 kr</Text>
                            </Flex>
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text weight="bold">Sådan vinder du</Text>
                            <Text size="2" color="gray">
                                Match de 3 vindernumre i vilkårlig rækkefølge.<br />
                                70% af puljen fordeles ud blandt vindere hver søndag i Jerne IF.
                            </Text>
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text weight="bold">Autoplay & Betaling</Text>
                            <Text size="2" color="gray">
                                Aktivér autoplay for automatisk deltagelse hver uge. Indbetal via MobilePay.
                            </Text>
                        </Flex>
                    </Flex>
                </Card>
            </Flex>
        </Page>
    );
}