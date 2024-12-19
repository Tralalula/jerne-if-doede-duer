import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Button, Flex, Grid, Separator, Text, TextField } from "@radix-ui/themes";
import LoadingButton from "../../Button/LoadingButton";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { BoardWinningSequenceRequest, useBoard, useToast } from "../../import";
import { Fragment } from "react/jsx-runtime";


interface ConfirmWinningSeqProps {
    setState: React.Dispatch<React.SetStateAction<"select" | "confirm" | "success">>;
}

export default function ConfirmWinningSeq({ setState }: ConfirmWinningSeqProps) {
    const {boardPickWinSeq, confirmWinSeq, isGettingBoardWinSeq} = useBoard();
        const { showToast } = useToast();
    
    const { 
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({});

    const onSubmit: SubmitHandler<any> = async (data) => {
        try {
            const boardWinningSequenceRequest: BoardWinningSequenceRequest = {
                selectedNumbers: boardPickWinSeq?.selectedNumbers ?? [],
            };

            await confirmWinSeq(boardWinningSequenceRequest);
            setState("success");
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
                    {boardPickWinSeq && boardPickWinSeq.selectedNumbers.map((num, i) => (
                        <Fragment key={i}>
                            <Badge size="3">{num}</Badge>
                            {i < boardPickWinSeq.selectedNumbers.length - 1 && <Text>-</Text>}
                        </Fragment>
                    ))}
                    </Flex>

                    <Separator className="w-full"/>
                        <Text align='center' className="w-100" size='2' as="label" weight="medium">
                            Uge: <b>{boardPickWinSeq?.currentGameField}</b>
                        </Text>
                    <Separator className="w-full"/>

                <Grid className="w-full" columns={{ initial: "2" }} gap="2">
                    <Button type="button" variant="outline" className="transition-colors duration-200 cursor-pointer" onClick={() => setState("select")}>
                        Tilbage
                    </Button>
                    <LoadingButton type="submit" isLoading={isGettingBoardWinSeq}>
                        Afslut denne uge
                    </LoadingButton>
                </Grid>
            </Flex>
        </form>
    )
}