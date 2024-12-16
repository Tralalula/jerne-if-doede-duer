import { Flex, Grid, Heading, Skeleton, Text } from "@radix-ui/themes";
import { GameStatus } from "../../types";
import { Countdown } from "../import";
import { useEffect, useState } from "react";

interface InactiveGameProps {
    boardStatus: GameStatus;
    loading: boolean;
}

export default function InactiveGame({boardStatus, loading}: InactiveGameProps) {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!boardStatus?.startTime) return;
    
            const targetTime = new Date(boardStatus.startTime).getTime();
            const currentTime = Date.now();
            const diff = targetTime - currentTime;
    
            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                window.location.reload();
                return;
            }
    
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
            setTimeLeft({ hours, minutes, seconds });
        };
    
        calculateTimeLeft();
    
        const intervalId = setInterval(calculateTimeLeft, 1000);
    
        return () => clearInterval(intervalId);
    }, [boardStatus?.startTime]);

    return (
        <>
        <Flex justify="center" direction="column" className="w-full md:py-2 md:items-center">
            <Flex direction="column" className="text-center">
                <Skeleton loading={loading}>
                    <Heading className="transition-all duration-200 text-2xl sm:text-2xl md:text-3xl">
                        Ingen aktive spil fundet!
                    </Heading>
                </Skeleton>
            </Flex>
        </Flex>
        <Flex justify="center" align="center" direction="column" className="w-full h-full py-4 -mt-10 min-h-[50px]">
            <Skeleton loading={loading}>
                <Heading className="pb-2">Næste uges spil starter om</Heading>                    
            </Skeleton>
            <Flex align='center' justify='center' direction='column' className="p-4 rounded-lg backdrop-blur-md bg-whiteA5 dark:bg-gray1/75">
                <Grid columns={{ initial: "3", md: "3" }} gap="5" width="auto">
                    <Skeleton loading={loading}>
                        <Countdown type="t" padding={40} className="bg-red8/40 rounded-lg" value={timeLeft.hours}/>
                    </Skeleton>
                    <Skeleton loading={loading}>
                        <Countdown type="m" padding={40} className="bg-red8/40 rounded-lg" value={timeLeft.minutes}/>
                    </Skeleton>
                    <Skeleton loading={loading}>
                        <Countdown type="s" padding={40} className="bg-red8/40 rounded-lg" value={timeLeft.seconds}/>
                    </Skeleton>
                </Grid>
            </Flex>
        </Flex>
        </>
    )
}