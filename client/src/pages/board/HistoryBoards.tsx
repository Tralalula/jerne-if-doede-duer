import { Flex, Grid, Heading, Skeleton, Text } from "@radix-ui/themes";
import { GameStatus } from "../../types";
import { Countdown } from "../import";
import { useEffect, useState } from "react";

export default function HistoryBoards() {
    return (
        <>
        <Flex justify="center" direction="column" className="w-full md:py-2 md:items-center">
            <Flex direction="column" className="text-center">
            </Flex>
        </Flex>
        <Flex justify="center" align="center" direction="column" className="w-full h-full py-4 -mt-10 min-h-[50px]">
            <Flex align='center' justify='center' direction='column' className="p-4 rounded-lg backdrop-blur-md bg-whiteA5 dark:bg-gray1/75">
                <Grid columns={{ initial: "3", md: "3" }} gap="5" width="auto">

                </Grid>
            </Flex>
        </Flex>
        </>
    )
}