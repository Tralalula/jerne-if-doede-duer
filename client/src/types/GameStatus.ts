export interface GameStatus {
    currentWeek: number;
    isGameActive: boolean;
    startTime: Date;
    endTime: Date;
    timeLeft: number;
}