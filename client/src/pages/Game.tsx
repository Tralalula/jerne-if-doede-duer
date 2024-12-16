import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Separator, Skeleton, Text, TextField } from "@radix-ui/themes";
import { GameButton, Countdown, Page, ResizablePanel, LoadingButton } from "../components";
import { Fragment, useEffect, useState } from "react";
import { useBoard, useToast } from "../hooks";
import { SubmitHandler, useForm } from "react-hook-form";
import { Board, BoardPickRequest, BoardPickResponse } from "../Api";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema: yup.ObjectSchema<BoardPickRequest> = yup
    .object({
        amount: yup
            .number()
            .min(1, "Minimum 1 board skal være valgt")
            .required("Mængde er påkrævet"),
        selectedNumbers: yup
            .array()
            .of(
                yup
                    .number()
                    .typeError("Hvert valgt nummer skal være et tal")
                    .required("Numre kan ikke være tomme")
                    .min(1, "Numre skal være mindst 1")
                    .max(16, "Numre må ikke være større end 16")
            )
            .min(5, "Du skal vælge mindst 5 numre")
            .max(8, "Du må højst vælge 8 numre")
            .required("Valgte numre er påkrævet"),
    })
    .required();

export default function Game() {
    const {boardStatus, loading, placeBoardPick, isPlacingBoardPick, error} = useBoard();

    const { showToast } = useToast();

    const [boughtBoard, setBoughtBoard] = useState<BoardPickResponse>();

    let [state, setState] = useState<"select" | "confirm" | "bought">("select");
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const maxNumbers = 8;
    const minNumbers = 5;

    const [boardAmount, setBoardAmount] = useState<number>(1);

    const handleBackFromPurchase = () => {
        setBoardAmount(1);
        setBoughtBoard(undefined);
        setSelectedNumbers([]);
        setState("select")
    }

    const toggleNumber = (num: number) => {
        setSelectedNumbers((prev) => {
            if (prev.includes(num)) {
                return prev.filter((n) => n !== num);
            } else if (prev.length < maxNumbers) {
                return [...prev, num].sort((a, b) => a - b);
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

    const onSubmit: SubmitHandler<BoardPickRequest> = async (data) => {
        console.log("Form Data Submitted:", data);
    
        try {
            const boards = await placeBoardPick(data);
            showToast("Bræt registreret", "Dit bræt blev købt!", "success");

            setBoughtBoard(boards);
            setState("bought")
        } catch (err: any) {
            const errorMessage = 
                err?.detail ||
                (err instanceof Error ? err.message : "Der skete en ukendt fejl");
    
            showToast("Ups! En fejl skete", errorMessage, "error");
        }
    };

    const { 
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            amount: boardAmount,
            selectedNumbers: [],
        },
    });

    useEffect(() => {
        console.log("Validation Errors:", errors);
    }, [errors]);

    useEffect(() => {
        setValue("selectedNumbers", selectedNumbers);
    }, [selectedNumbers, setValue]);

    const canProceed = selectedNumbers.length >= minNumbers && boardStatus?.isGameActive;

    return (
        <Page>
            <Flex direction='column' className=" w-full h-full pl-4 pr-4 md:pl-0 md:pr-0">
                <Flex justify="center" direction="column" className="w-full md:py-2 md:items-center">
                    <Flex direction="column" className="text-center">
                        <Skeleton loading={loading}>
                            <Heading className="transition-all duration-200 text-2xl sm:text-2xl md:text-3xl">
                                Velkommen til denne uges spil!
                            </Heading>
                        </Skeleton>
                        <Skeleton loading={loading}>
                            <Text color="gray" className="transition-all duration-200 text-md">
                                Spillet er igang for uge: {boardStatus?.currentWeek}
                            </Text>
                        </Skeleton>
                    </Flex>
                </Flex>
                <Flex justify="center" align="center" direction="column" className="w-full h-full py-4 -mt-2 min-h-[50px]">
                    <Skeleton loading={loading}>
                    <Heading className="pb-2">
                        {state === "select" 
                            ? "Vælg dine tal" 
                            : state === "confirm" 
                            ? "Bekræft valg" 
                            : "Tak for dit køb!"}
                    </Heading>                    
                </Skeleton>
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
                                    <Skeleton key={i} loading={loading}>
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
                                    </Skeleton>
                                    );
                                })}
                            </Grid>
                            <Separator className="w-full"/>
                            {canProceed &&
                                <Text>Credits ialt: {calculatePrice()} Credits</Text>
                            }  
                            <Skeleton loading={loading}>
                                <Button disabled={!canProceed} className="w-full cursor-pointer transition-colors duration-200" onClick={() => setState("confirm")}>Næste</Button>
                            </Skeleton>
                        </Flex>
                        </ResizablePanel.Content>
                            <ResizablePanel.Content value="confirm">
                            <form method="post" onSubmit={handleSubmit(onSubmit)}>
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
                                        {boardStatus?.currentWeek}
                                    </Badge>

                                    <Separator className="w-full"/>
                                    <Flex gap='2'>
                                        <Text>Antal:</Text>
                                        <TextField.Root {...register("amount", { value: boardAmount, required: true })} type="number" size="1" min='1' placeholder="1" value={boardAmount} onChange={(e) => setBoardAmount(parseToInt(e.target.value))}/>
                                    </Flex>

                                    <Separator className="w-full"/>
                                    <Flex gap='1'>
                                        Total: <Text className="underline">{calculatePrice() * boardAmount}</Text> Credits
                                    </Flex>
                                    <input
                                        type="hidden"
                                        {...register("selectedNumbers", {
                                            required: "Du skal vælge mindst 5 numre",
                                            validate: () => {
                                                if (selectedNumbers.length < minNumbers) {
                                                    return `Du skal vælge mindst ${minNumbers} numre`;
                                                }
                                                if (selectedNumbers.length > maxNumbers) {
                                                    return `Du må højst vælge ${maxNumbers} numre`;
                                                }
                                                return true;
                                            },
                                        })}
                                    />

                                    <Grid className="w-full" columns={{ initial: "2" }} gap="2">
                                        <Button variant="outline" className="transition-colors duration-200 cursor-pointer" onClick={() => setState("select")}>
                                            Tilbage
                                        </Button>
                                        <LoadingButton type="submit" disabled={boardAmount <= 0} isLoading={isPlacingBoardPick}>
                                            <Text>Bekræft valg</Text>
                                        </LoadingButton>
                                    </Grid>

                                </Flex>
                                </form>
                            </ResizablePanel.Content>
                            <ResizablePanel.Content value="bought">
                                <Flex className="w-full" justify='center' align='center' direction='column' gap='3'>
                                {boughtBoard && 
                                    <>
                                    <Text>
                                        Vi har registreret {boughtBoard.amount === 1 ? 'dit' : 'dine'} bræt!
                                    </Text>
                                    <Separator className="w-full"/>
                                    <Text>
                                        Du har købt <b className="underline">{boughtBoard.amount}</b> af dette bræt:
                                    </Text>
                                    <Flex gap='1' className="pt-1">
                                        {boughtBoard.selectedNumbers.map((num, i) => (
                                            <Fragment key={i}>
                                                <Badge size="3">{num}</Badge>
                                                {i < selectedNumbers.length - 1 && <Text>-</Text>}
                                            </Fragment>
                                        ))}
                                        </Flex>
                                        <Separator className="w-full"/>

                                        <Text>
                                            Credits trukket ialt: {boughtBoard.total}
                                        </Text>

                                        <Button variant="outline" className="transition-colors duration-200 cursor-pointer w-full" onClick={() => handleBackFromPurchase()}>
                                            Tilbage
                                        </Button>

                                    </>
                                }
                                </Flex>

                            </ResizablePanel.Content>
                        </ResizablePanel.Root>
                    </Flex>
                </Flex>
            </Flex>
        </Page>
    )
}