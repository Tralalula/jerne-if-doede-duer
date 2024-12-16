import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
    api,
    boardErrorAtom,
    boardLoadingAtom,
    gameStatusAtom,
} from './import';

export function useBoard() {
    const [boardStatus, setBoardStatus] = useAtom(gameStatusAtom);
    const [loading, setLoading] = useAtom(boardLoadingAtom);
    const [error, setError] = useAtom(boardErrorAtom);

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

    useEffect(() => {
        fetchGameStatus();
    }, []);

    return {
        boardStatus,
        loading,
        error,
    };
}
