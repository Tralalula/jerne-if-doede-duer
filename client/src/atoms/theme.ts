import { atom } from 'jotai';

type RadixTheme = "light" | "dark";

const initialTheme: RadixTheme =
  (localStorage.getItem('theme') as RadixTheme) || "dark";

export const themeAtom = atom<RadixTheme>(initialTheme);
