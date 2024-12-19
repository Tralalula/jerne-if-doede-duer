import { atom, BoardWinningSequenceConfirmedResponse, BoardWinningSequenceResponse, GameStatus } from './import'

export const gameStatusAtom = atom<GameStatus>();
export const gameStatusFetchError = atom<string | null>(null);

export const boardLoadingAtom = atom(false);
export const boardPlacingBetAtom = atom(false);


export const boardConfirmWinSeqAtom = atom<BoardWinningSequenceConfirmedResponse>();
export const boardPickWinSeqAtom = atom<BoardWinningSequenceResponse>();

export const boardPickWinSeqErrorAtom = atom<string | null>(null);


export const boardPickWinSeqLoadingAtom = atom(false);
export const boardConfirmWinSeqLoadingAtom = atom(false);
