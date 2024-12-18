import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, Text, TextField } from "@radix-ui/themes";
import LoadingButton from "../../Button/LoadingButton";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useBoard, useToast } from "../../import";

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

interface GetWinningSeqProps {
    setState: React.Dispatch<React.SetStateAction<"select" | "confirm" | "success">>;
}

export default function GetWinningSeq({ setState }: GetWinningSeqProps) {
    const {isGettingBoardWinSeq, fetchPickWinSeq} = useBoard();
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
    )
}