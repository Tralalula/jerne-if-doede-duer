import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
    api,
    gameStatusFetchError,
    boardLoadingAtom,
    BoardPickRequest,
    gameStatusAtom,
    boardPlacingBetAtom
} from './import';

export function useBoard() {
    const [boardStatus, setBoardStatus] = useAtom(gameStatusAtom);
    const [loading, setLoading] = useAtom(boardLoadingAtom);
    const [error, setError] = useAtom(gameStatusFetchError);
    const [isPlacingBoardPick, setIsPlacingBoardPick] = useAtom(boardPlacingBetAtom);

    const fetchGameStatus = async () => {
        setLoading(true);
        setError(null);
    
        try {
            const response = await api.board.getStatus();
            const data = response.data;
        
            const gameStatus = {
                currentWeek: data.gameWeek,
                isGameActive: data.isGameActive,
                startTime: new Date((data.startTime ?? 0) * 1000),
                endTime: new Date((data.endTime ?? 0) * 1000),
                timeLeft: data.timeLeft ?? 0,
            };
    
            setBoardStatus(gameStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kunne ikke hente spilstatus');
        } finally {
            setLoading(false);
        }
    };

    const placeBoardPick = async (request: BoardPickRequest) => {
        setIsPlacingBoardPick(true);

        try {
            const response = await api.board.pickBoard(request);
            return response.data;
        } catch (err: any) {
            if (err.response && err.response.data)
                throw err.response.data;
    
            throw new Error("An unexpected error occurred.");
        } finally {
            setIsPlacingBoardPick(false);
        }
    };


    useEffect(() => {
        fetchGameStatus();
    }, []);

    return {
        boardStatus,
        placeBoardPick,
        isPlacingBoardPick,
        loading,
        error,
    };
}
