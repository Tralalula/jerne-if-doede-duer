import React, { Fragment } from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import {Card, Text, Flex, Dialog, Button, Heading, TextField, Badge, Separator} from '@radix-ui/themes';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { userPagingAtom, useFetchUsers, userSortAtom, useToast } from '../import';
import PageInfoDisplay from '../Pagination/PageInfoDisplay';
import PageSizeSelector from '../Pagination/PageSizeSelector';
import Pagination from '../Pagination/Pagination';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from 'react-hook-form';
import { LoadingButton, ResizablePanel } from '..';

const schema = yup.object({
    winningNumbers: yup
        .number()
        .required("Vinder sekvens er påkrævet")
        .min(5, "Vinder sekvens skal minimum være 5 tegn")
        .max(8, "Vinder sekvens kan maks være 8 tegn"),
}).required();


export default function PickBox() {
    let [state, setState] = useState<"select" | "confirm" | "success">("select");
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

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
                                <Text as="label" size="2" weight="medium" mb="2">
                                    Vindertal
                                </Text>
                                <TextField.Root
                                    variant="soft"
                                    color="gray"
                                    placeholder="1-5-8-12-15"
                                    className='border dark:border-gray5 mb-2'/>
                                <LoadingButton isLoading={false} onClick={() => setState("confirm")}>
                                    Næste
                                </LoadingButton>
                            </ResizablePanel.Content>
                            <ResizablePanel.Content value="confirm">
                                <Flex gap='2' direction='column'>
                                <Text as="label" size="2" weight="medium">
                                    Der blev fundet <b>5</b> vindere med nedenstående:
                                </Text>
                                <Flex justify='center' align='center' direction='row'>
                                    {selectedNumbers.map((num, i) => (
                                        <Fragment key={i}>
                                            <Badge size="3">{num}</Badge>
                                            {i < selectedNumbers.length - 1 && <Text>-</Text>}
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