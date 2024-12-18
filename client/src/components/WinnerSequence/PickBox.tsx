import React, { Fragment } from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import {Card, Text, Flex, Dialog, Button, Heading, TextField, Badge, Separator} from '@radix-ui/themes';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { userPagingAtom, useFetchUsers, userSortAtom, useToast, useBoard, BoardWinningSequenceRequest } from '../import';
import PageInfoDisplay from '../Pagination/PageInfoDisplay';
import PageSizeSelector from '../Pagination/PageSizeSelector';
import Pagination from '../Pagination/Pagination';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from 'react-hook-form';
import { LoadingButton, ResizablePanel } from '..';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';

const schema = yup.object({
    winningNumbers: yup
        .string()
        .required("Vinder sekvens er påkrævet")
        .matches(/^\d+(-\d+)*-?$/, "Vinder sekvens skal kun indeholde tal og bindestreger")
        .test(
            "is-valid-array",
            "Vinder sekvens skal være en gyldig liste af tal",
            (value) => value 
                ? value
                      .replace(/-$/, "")
                      .split('-')
                      .every(num => !isNaN(Number(num))) 
                : false
        ),
}).required();

type FormValues = {
    winningNumbers: string;
};

export default function PickBox() {
    const { showToast } = useToast();

    let [state, setState] = useState<"select" | "confirm" | "success">("select");
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

    const [textNumbers, setTextNumbers] = useState<string>("");

    const {isGettingBoardWinSeq, boardPickWinSeqError, boardPickWinSeq, fetchPickWinSeq} = useBoard();

    const { 
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

    // Handle form submission
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            const parsedNumbers = data.winningNumbers.replace(/-/g, ",");
    
            await fetchPickWinSeq(parsedNumbers);
            setState("confirm");
        } catch (err: any) {
            const errorMessage =
                err?.detail ||
                (err instanceof Error ? err.message : "Der skete en ukendt fejl");
    
            showToast("Ups! En fejl skete", errorMessage, "error");
        }
    };

    useEffect(() => {
        const newNumbers = [1, 2, 3, 4, 5];
        setSelectedNumbers(newNumbers);
    }, [])

    const [paging, setPaging] = useAtom(userPagingAtom);
    const [sort] = useAtom(userSortAtom);
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    return (
        <>
            {/* Desktop */}
            <Flex justify='center' gap="4" className="lg:flex">
                    <Card className='w-auto p-5 backdrop-blur-md' asChild variant="ghost" size="1" style={{ boxShadow: 'var(--shadow-5)'}}>
                    <Flex direction="column" className='min-w-80'>
                        <ResizablePanel.Root value={state}>
                            <ResizablePanel.Content value="select">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                <Text as="label" size="2" weight="medium" mb="2">
                                    Vindertal
                                </Text>
                                <TextField.Root
                                    variant="soft"
                                    color="gray"
                                    placeholder="1-5-8-12-15"
                                    className={`border dark:border-gray5 ${errors.winningNumbers ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : "mb-2"}`}
                                    {...register("winningNumbers")}/>
                                <Flex mt="1" align="center" className={`error-wrapper ${errors.winningNumbers ? 'error-visible' : ''}`}>
                                    <Text color="red" size="1" className="flex mb-2 gap-1 items-center">
                                        <FontAwesomeIcon icon={faWarning} />
                                        {errors.winningNumbers?.message}
                                    </Text>
                                </Flex>
                                <LoadingButton type='submit' isLoading={isGettingBoardWinSeq}>
                                    Næste
                                </LoadingButton>
                                </form>
                            </ResizablePanel.Content>
                            <ResizablePanel.Content value="confirm">
                                <Flex gap='2' direction='column'>
                                <Text as="label" size="2" weight="medium">
                                    {boardPickWinSeq && boardPickWinSeq?.winnerAmounts > 0 ? (
                                        <Text>
                                            Der blev fundet <b>{boardPickWinSeq?.winnerAmounts}</b> vindere med nedenstående:
                                        </Text>
                                    ) : (
                                        <Text>
                                            Der blev fundet ikke fundet nogle vindere
                                        </Text>
                                    )}
                                </Text>
                                <Flex justify='center' align='center' direction='row'>
                                    {boardPickWinSeq && boardPickWinSeq?.winnerAmounts > 0 && boardPickWinSeq.selectedNumbers.map((num, i) => (
                                        <Fragment key={i}>
                                            <Badge size="3">{num}</Badge>
                                            {i < boardPickWinSeq.selectedNumbers.length - 1 && <Text>-</Text>}
                                        </Fragment>
                                    ))}
                                    </Flex>
                                    <Separator className="w-full"/>
                                <Button className='mt-2 w-full cursor-pointer transition-colors duration-200'>
                                    Afslut denne uges spil
                                </Button>
                                                                    
                                </Flex>

                            </ResizablePanel.Content>

                        </ResizablePanel.Root>
                    </Flex>
                        
                    </Card>

            </Flex>
        </>
    );
}