import { Flex, Text } from "@radix-ui/themes";
import { Page } from "../../components";
import { useBoard } from "../../hooks";
import ActiveGame from "./ActiveGame";
import InactiveGame from "./InactiveGame";

export default function Game() {
    const {boardStatus, loading, placeBoardPick, isPlacingBoardPick, error} = useBoard();

    return (
        <Page>
            <Flex direction='column' className=" w-full h-full pl-4 pr-4 md:pl-0 md:pr-0">
            {boardStatus && (
                boardStatus.isGameActive ? (
                    <ActiveGame
                        boardStatus={boardStatus}
                        loading={loading}
                        placeBoardPick={placeBoardPick}
                        isPlacingBoardPick={isPlacingBoardPick}
                    />
                ) : (
                    <InactiveGame
                        boardStatus={boardStatus}
                        loading={loading}
                    />
                )
            )}
            </Flex>
        </Page>
    )
}