import { Flex, Heading, Text } from "@radix-ui/themes";
import { Page } from "../import";
import GameBoardHistoryListView from "../../components/GameBoardHistory/GameBoardHistoryListView";
import { useParams } from "react-router-dom";
import { useFetchGameBoardHistory } from "../../hooks/useFetchGameBoardHistory";
import { useEffect } from "react";

export default function GameBoardHistoryPage() {
    const { gameId } = useParams();

    const { setCurrentGameId, entry } = useFetchGameBoardHistory();

    useEffect(() => {
        if (gameId) {
            setCurrentGameId(gameId)
        } else {
            console.error('Game ID er ikke defineret.');
        }
    }, [gameId]);

    /*
    const [getUserDetails] = useAtom(getUserDetailsAtom);
    const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);

    useEffect(() => {
        const loadUserDetails = async () => {
            if (userId) {
                const user = await getUserDetails(userId);
                setUserDetails(user);
            }
        };

        loadUserDetails();
    }, [userId, getUserDetails]);*/

    const formattedSequence = entry?.winningSequence?.join('-');

    return (
        <Page>

            {/* Indhold */}
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                <div className="hidden md:block">

                </div>

                {/* Mobil/tablet */}
                <div className="lg:hidden w-full pt-6 lg:pt-0 text-center">
                    <Heading size="6" mb="2">
                        Spil historik - uge: {entry?.week}
                    </Heading>
                    {formattedSequence && (
                        <Text size="2" color="gray" weight="medium">
                            Vinder sekvens: {formattedSequence}
                        </Text>
                    )}
                </div>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Spil historik - uge: {entry?.week}</Heading>
                    {formattedSequence && (
                        <Text size="3" color="gray" weight="medium">
                            Vinder sekvens: {formattedSequence}
                        </Text>
                    )}
                </Flex>

                <GameBoardHistoryListView />
            </Flex>
        </Page>
    )
}