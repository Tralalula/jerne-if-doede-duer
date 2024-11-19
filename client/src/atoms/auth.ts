import { api, atom } from './import';
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export const TOKEN_KEY = "token";
export const tokenStorage = createJSONStorage<string | null>(
    () => sessionStorage
);

export const jwtAtom = atomWithStorage<string | null>(TOKEN_KEY, null, tokenStorage);

export const userInfoAtom = atom(async (get) => {
    if (!get(jwtAtom)) return null;
    
    const response = await api.auth.userInfo();
    return response.data;
}); 