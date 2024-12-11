import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import { GameButton, Countdown, Page, ResizablePanel, LoadingButton } from "../components";
import { Fragment, useEffect, useState } from "react";
import WeekPicker from "../components/Feedback/WeekPicker";

export default function Game() {
    let [state, setState] = useState<"select" | "confirm">("select");
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const maxNumbers = 8;
    const minNumbers = 5;


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

      const toggleNumber = (num: number) => {
        setSelectedNumbers((prev) => {
            if (prev.includes(num)) {
                return prev.filter((n) => n !== num);
            } else if (prev.length < maxNumbers) {
                return [...prev, num];
            }
            return prev;
        });
    };

    const calculatePrice = () => {
        const count = selectedNumbers.length;
        if (count === 5) return 20;
        if (count === 6) return 40;
        if (count === 7) return 80;
        if (count === 8) return 160;
        return 0;
    };

    const canProceed = selectedNumbers.length >= minNumbers;

    return (
        <Page>
            <Flex direction='column' className=" w-full h-full pl-4 pr-4 md:pl-0 md:pr-0">
                <Flex justify="center" direction="column" className="w-full md:py-2 md:items-center">
                    <Flex direction="column" className="text-center">
                        <Heading className="transition-all duration-200 text-2xl sm:text-2xl md:text-3xl">
                            Velkommen til denne uges spil!
                        </Heading>
                        <Text color="gray" className="transition-all duration-200 text-md">
                            Spillet er igang for uge: 46
                        </Text>
                    </Flex>
                </Flex>
                <Flex justify="center" align="center" direction="column" className="w-full h-full py-4 -mt-2 min-h-[50px]">
                    <Heading className="pb-2">{state === "select" ? 'Vælg dine tal' : 'Bekræft valg'}</Heading>
                    <Flex gap='3' justify='center' align="center" direction="column" className="p-2 rounded-lg backdrop-blur-md bg-whiteA5 dark:bg-gray1/75" style={{ boxShadow: "var(--shadow-5)" }}>
                    <ResizablePanel.Root value={state}>
                        <ResizablePanel.Content value="select">
                        <Flex justify='center' align='center' direction='column' gap='3'>
                            <Grid className="p-2 transition-all duration-200" align="center" justify="center" columns={{ initial: "4", md: "4" }} gap="3">
                                {Array.from({ length: 16 }, (_, i) => {
                                    const num = i + 1;
                                    const isSelected = selectedNumbers.includes(num);
                                    const isDisabled = !isSelected && selectedNumbers.length >= maxNumbers;

                                    return (
                                    <GameButton
                                        key={i}
                                        className="md:p-12 p-8 w-full cursor-pointer"
                                        isSelected={isSelected}
                                        selectable={!isDisabled}
                                        disabled={isDisabled}
                                        onClick={() => toggleNumber(num)}
                                    >
                                        {num}
                                    </GameButton>
                                    );
                                })}
                            </Grid>
                            <Separator className="w-full"/>
                                <Text>Credits ialt: {calculatePrice()} DKK</Text>
                            <Button disabled={!canProceed} className="w-full cursor-pointer transition-colors duration-200" onClick={() => setState("confirm")}>Næste</Button>
                        </Flex>
                        </ResizablePanel.Content>
                            <ResizablePanel.Content value="confirm">
                                <Flex className="w-full" justify='center' align='center' direction='column' gap='3'>
                                    <Text>
                                        Du har valgt følgende <b>{selectedNumbers.length}</b> numre:
                                    </Text>
                                    <Flex gap='1' className="pt-1">
                                    {selectedNumbers.map((num, i) => (
                                        <Fragment key={num}>
                                            <Badge size="3">{num}</Badge>
                                            {i < selectedNumbers.length - 1 && <Text>-</Text>}
                                        </Fragment>
                                    ))}

                                        </Flex>
                                    <Separator className="w-full"/>
                                    <Text>
                                        Dette valg gøre sig gældende for uge:
                                    </Text>
                                    <Badge className="text-white" size='3'>
                                        46
                                    </Badge>
                                    <LoadingButton isLoading={false}>
                                        <Text>
                                            Bekræft valg
                                        </Text>
                                    </LoadingButton>
                                    <WeekPicker/>
                                    <LoadingButton isLoading={false}>
                                        <Text>
                                            Bekræft valg
                                        </Text>
                                    </LoadingButton>
                                </Flex>
                            </ResizablePanel.Content>
                        </ResizablePanel.Root>
                    </Flex>
                </Flex>
            </Flex>
        </Page>
    )
}