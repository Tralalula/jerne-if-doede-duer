import { Flex, Grid, Heading, Skeleton, Text } from "@radix-ui/themes";
import { GameStatus } from "../../types";
import { Countdown, Page } from "../import";
import { useEffect, useState } from "react";
import BoardHistoryListView from "../../components/BoardHistory/BoardHistoryListView";

export default function MyBoardHistory() {
    return (
        <Page>

            {/* Indhold */}
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                <div className="hidden md:block">

                </div>

                {/* Mobil/tablet */}
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Heading size="6">Bræt historik</Heading>
                </Flex>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Bræt historik</Heading>
                </Flex>

                <BoardHistoryListView />
            </Flex>
        </Page>
    )
}