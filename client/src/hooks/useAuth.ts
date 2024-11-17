import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { api, isLoggedInAtom, userInfoAtom, AppRoutes } from './import';
import { UserInfoResponse, LoginRequest } from '../Api.ts';

type AuthHook = {
    user: UserInfoResponse | null;
    login: (loginRequest: LoginRequest) => Promise<void>;
    logout: () => void;
};

export const useAuth = (): AuthHook => {
    const [_, setIsLoggedIn] = useAtom(isLoggedInAtom);
    const [user] = useAtom(userInfoAtom);
    const navigate = useNavigate();
    
    const login = async (loginRequest: LoginRequest) => {
        await api.auth.login(loginRequest);
        setIsLoggedIn(true);
        navigate(AppRoutes.Home);
    };
    
    const logout = async () => {
        await api.auth.logout();
        setIsLoggedIn(false);
        navigate(AppRoutes.Login);
    };
    
    return { user, login, logout };
};