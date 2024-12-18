import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Button, Flex, Separator, Text, TextField } from "@radix-ui/themes";
import LoadingButton from "../../Button/LoadingButton";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useBoard, useToast } from "../../import";
import { Fragment } from "react/jsx-runtime";

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

interface ConfirmWinningSeqProps {
    setState: React.Dispatch<React.SetStateAction<"select" | "confirm" | "success">>;
}

export default function ConfirmWinningSeq({ setState }: ConfirmWinningSeqProps) {
    const {boardPickWinSeq, fetchPickWinSeq} = useBoard();
        const { showToast } = useToast();
    
    const { 
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

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

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
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

        </form>
    )
}