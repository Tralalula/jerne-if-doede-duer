import { Box, Button, Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { Countdown, Page } from "../components";
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
            <Flex justify='center' align='center' direction='column' className="w-full h-full">
            <Flex justify='center' align='center' direction='column' className="max-w-full sm:max-w-md md:max-w-2xl lg:max-w-4xl w-full md:p-4">
                <Flex direction='column' className="text-center">
                <Heading className="text-2xl sm:text-2xl md:text-3xl">
                    Velkommen til denne uges spil!
                </Heading>
                <Text color="gray" className="text-md">
                    Spillet er igang for uge: 46
                </Text>
                </Flex>
                <Flex py='6'>
                    <Flex gap='5' direction='column' align='center' justify='center' className="p-5 rounded-lg w-auto backdrop-blur-md bg-whiteA5 dark:bg-gray1/75" style={{ boxShadow: 'var(--shadow-5)'}}>
                        <Heading size='5'>
                            Vær med & vind
                        </Heading>
                        <Grid columns={{ initial: "3", md: "3" }} gap="5" width="auto">
                            <Countdown type="h" padding={40} className="bg-red8/40 rounded-lg" value={time.hours}/>
                            <Countdown type="m" padding={40} className="bg-red8/40 rounded-lg" value={time.minutes}/>
                            <Countdown type="s" padding={40} className="bg-red8/40 rounded-lg" value={time.seconds}/>
                        </Grid>
                        <Button className="hidden lg:block transition-colors duration-200 cursor-pointer">
                            Vær med!
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
            <Flex align='center' justify='center' className="w-full border-t h-full backdrop-blur-md bg-whiteA5 dark:bg-gray1/75">
                asdsad
            </Flex>
            </Flex>
        </Page>
    )
}