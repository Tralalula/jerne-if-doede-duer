import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { api, jwtAtom, userInfoAtom, AppRoutes } from './import';
import { UserInfoResponse, LoginRequest } from '../Api.ts';

type AuthHook = {
    user: UserInfoResponse | null;
    login: (loginRequest: LoginRequest) => Promise<void>;
    logout: () => void;
};

export const useAuth = (): AuthHook => {
    const [_, setJwt] = useAtom(jwtAtom); 
    const [user] = useAtom(userInfoAtom);
    const navigate = useNavigate();
    
    const login = async (loginRequest: LoginRequest) => {
        const response = await api.auth.login(loginRequest);
        const data = response.data;
        setJwt(data.jwt!);
        navigate(AppRoutes.Home);
    };
    
    const logout = async () => {
        // await api.auth.logout();
        setJwt(null);
        navigate(AppRoutes.Login);
    };
    
    return { user, login, logout };
};