import { atom, GameStatus } from './import'

export const gameStatusAtom = atom<GameStatus>();

export const boardLoadingAtom = atom(false);
export const boardErrorAtom = atom<string | null>(null);
