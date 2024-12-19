import { Flex, Heading } from "@radix-ui/themes";
import { Page } from "../import";
import GameHistoryListView from "../../components/GameHistory/GameHistoryListView";

export default function GameHistoryPage() {
    return (
        <Page>

            {/* Indhold */}
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                <div className="hidden md:block">

                </div>

                {/* Mobil/tablet */}
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Heading size="6">Spil historik</Heading>
                </Flex>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Spil historik</Heading>
                </Flex>

                <GameHistoryListView />
            </Flex>
        </Page>
    )
}