import { Flex, Separator, Text } from "@radix-ui/themes";
import LoadingButton from "../../Button/LoadingButton";
import React from "react";
import { useBoard, usePrintPdf } from "../../import";
import "jspdf-autotable";

interface ConfirmedWinSeqProps {
    setState: React.Dispatch<React.SetStateAction<"select" | "confirm" | "success">>;
}

export default function ConfirmedWinSeq({ setState }: ConfirmedWinSeqProps) {
    const { boardConfirmWinSeq, isGettingBoardWinSeq } = useBoard();
    const { printWinningPdf } = usePrintPdf();

    return (
        <Flex justify="center" align="center" gap="2" direction="column">
            <Text as="label" size="2" weight="medium">
                <Text>Et nyt spil er blevet oprettet!</Text>
            </Text>
            <Separator className="w-full" />
            <LoadingButton type="button" onClick={() => printWinningPdf(boardConfirmWinSeq)} isLoading={isGettingBoardWinSeq}>
                Download vindere som .pdf
            </LoadingButton>
        </Flex>
    );
}
