import { api, atom } from './import';

export const isLoggedInAtom = atom(false);

export const userInfoAtom = atom(async (get) => {
    if (!get(isLoggedInAtom)) return null;

    const response = await api.auth.userInfo();
    return response.data;
}); 