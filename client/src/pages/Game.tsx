import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Separator, Skeleton, Text, TextField } from "@radix-ui/themes";
import { GameButton, Countdown, Page, ResizablePanel, LoadingButton } from "../components";
import { Fragment, useEffect, useState } from "react";
import { boolean } from "yup";
import { api } from "../http";
import { useBoard } from "../hooks";

export default function Game() {
    const {
        boardStatus,
        loading,
        error,
    } = useBoard();

    let [state, setState] = useState<"select" | "confirm">("select");
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const maxNumbers = 8;
    const minNumbers = 5;

    const [boardAmount, setBoardAmount] = useState<number>(1);

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

    const parseToInt = (value: string): number | string => {
        if (value === "") return "";
        const parsedValue = parseInt(value, 10);
        return isNaN(parsedValue) ? 1 : parsedValue;
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
                        <Skeleton loading={loading}>
                            <Text color="gray" className="transition-all duration-200 text-md">
                                Spillet er igang for uge: {boardStatus?.isGameActive ? 'Ja' : 'nej'} 
                            </Text>
                        </Skeleton>
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
                            {canProceed &&
                                <Text>Credits ialt: {calculatePrice()} Credits</Text>
                            }   
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
                                    <Badge className="dark:text-white text-black" size='3'>
                                        46
                                    </Badge>
                                    <Separator className="w-full"/>
                                    <Flex gap='2'>
                                        <Text>Antal:</Text>
                                        <TextField.Root type="number" size="1" min='1' placeholder="1" value={boardAmount} onChange={(e) => setBoardAmount(parseToInt(e.target.value))}/>
                                    </Flex>
                                    <Separator className="w-full"/>
                                    <Flex gap='1'>
                                        Total: <Text className="underline">{calculatePrice() * boardAmount}</Text> Credits
                                    </Flex>

                                    <Grid className="w-full" columns={{ initial: "2" }} gap="2">
                                        <Button variant="outline" className="cursor-pointer" onClick={() => setState("select")}>
                                            Tilbage
                                        </Button>
                                        <LoadingButton disabled={boardAmount <= 0} isLoading={false}>
                                            <Text>Bekræft valg</Text>
                                        </LoadingButton>
                                    </Grid>

                                </Flex>
                            </ResizablePanel.Content>
                        </ResizablePanel.Root>
                    </Flex>
                </Flex>
            </Flex>
        </Page>
    )
}