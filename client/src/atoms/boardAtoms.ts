import { atom, GameStatus } from './import'

export const gameStatusAtom = atom<GameStatus>();
export const gameStatusFetchError = atom<string | null>(null);


export const boardLoadingAtom = atom(false);
export const boardPlacingBetAtom = atom(false);
