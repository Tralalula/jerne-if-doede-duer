import { Box, Button, Card, Container, Flex, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import { GameButton, Countdown, Page } from "../components";
import { useEffect, useState } from "react";

export default function Game() {
    const [time, setTime] = useState({
        hours: new Date().getHours(),
        minutes: new Date().getMinutes(),
        seconds: new Date().getSeconds(),
      });
    
      useEffect(() => {
        const interval = setInterval(() => {
          const now = new Date();
          setTime({
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
          });
        }, 1000);
    
        return () => clearInterval(interval);
      }, []);

    return (
        <Page>
            <Flex direction='column' className="w-full h-full pl-4 pr-4 md:pl-0 md:pr-0">
                <Flex justify="center" direction="column" className="w-full md:py-2 md:items-center">
                    <Flex direction="column" className="text-center">
                        <Heading className="text-2xl sm:text-2xl md:text-3xl">
                            Velkommen til denne uges spil!
                        </Heading>
                        <Text color="gray" className="text-md">
                            Spillet er igang for uge: 46
                        </Text>
                    </Flex>
                </Flex>
                <Flex justify="center" align="center" direction="column" className="w-full h-full py-4 -mt-2">
                    <Heading className="pb-2">Vælg dine tal</Heading>
                    <Flex gap='3' justify='center' align="center" direction="column" className="p-2 rounded-lg backdrop-blur-md bg-whiteA5 dark:bg-gray1/75" style={{ boxShadow: "var(--shadow-5)" }}>
                        <Text>Du har valgt følgende:</Text>
                        <Grid className="p-2" align="center" justify="center" columns={{ initial: "4", md: "4" }} gap="3">
                            {Array.from({ length: 16 }, (_, i) => (
                                <GameButton className="md:p-12 p-8 w-full" key={i}>
                                    {i + 1}
                                </GameButton>
                            ))}
                        </Grid>
                        <Separator className="w-full"/>
                        <Button className="w-full">Næste</Button>
                    </Flex>
                </Flex>
            </Flex>
        </Page>
    )
}