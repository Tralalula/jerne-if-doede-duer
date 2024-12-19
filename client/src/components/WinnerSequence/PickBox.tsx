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
import GetWinningSeq from './forms/GetWinningSeq';
import ConfirmWinningSeq from './forms/ConfirmWinningSeq';
import ConfirmedWinSeq from './forms/ConfirmedWinSeq';

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
    let [state, setState] = useState<"select" | "confirm" | "success">("select");

    return (
        <>
            <Flex justify='center' gap="4" className="lg:flex">
                    <Card className='w-auto p-5 backdrop-blur-md' asChild variant="ghost" size="1" style={{ boxShadow: 'var(--shadow-5)'}}>
                    <Flex direction="column" className='min-w-80'>
                        <ResizablePanel.Root value={state}>
                            <ResizablePanel.Content value="select">
                                <GetWinningSeq setState={setState} />
                            </ResizablePanel.Content>
                            <ResizablePanel.Content value="confirm">
                                <ConfirmWinningSeq setState={setState}/>
                            </ResizablePanel.Content>
                            <ResizablePanel.Content value="success">
                                <ConfirmedWinSeq setState={setState}/>
                            </ResizablePanel.Content>

                        </ResizablePanel.Root>
                    </Flex>
                        
                    </Card>

            </Flex>
        </>
    );
}