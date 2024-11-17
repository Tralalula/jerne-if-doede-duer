import { atom } from './import';
import { Theme } from "daisyui";

const initialTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') as Theme || 'cupcake';

export const themeAtom = atom<string>(initialTheme);