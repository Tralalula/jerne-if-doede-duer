import { Flex, Heading } from "@radix-ui/themes";
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

    return (
        <Page>

            {/* Indhold */}
            <Flex className="p-4 w-full max-w-[1200px] mx-auto" gap="4" direction="column">
                <div className="hidden md:block">

                </div>

                {/* Mobil/tablet */}
                <Flex justify="center" className="lg:hidden w-full pt-6 lg:pt-0">
                    <Heading size="6">Spil historik - uge: {entry?.week}</Heading>
                </Flex>

                {/* Desktop */}
                <Flex justify="start" className="w-full hidden lg:block">
                    <Heading size="6">Spil historik - uge: {entry?.week}</Heading>
                </Flex>

                <GameBoardHistoryListView />
            </Flex>
        </Page>
    )
}