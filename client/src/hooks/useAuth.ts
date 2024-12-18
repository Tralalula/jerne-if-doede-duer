import { useAtom } from 'jotai';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, jwtAtom, tokenStorage, TOKEN_KEY, userInfoAtom, AppRoutes } from './import';
import { UserInfoResponse, LoginRequest } from '../Api.ts';
import { REDIRECT_PATH_KEY } from '../http';

type AuthHook = {
    user: UserInfoResponse | null;
    login: (loginRequest: LoginRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
};

export const useAuth = (): AuthHook => {
    const [_, setJwt] = useAtom(jwtAtom); 
    const [user, setUser] = useAtom(userInfoAtom);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = tokenStorage.getItem(TOKEN_KEY, null);
                if (token) {
                    const userResponse = await api.auth.userInfo({
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(userResponse.data);
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    if (error.response?.status !== 401) { 
                        setJwt(null);
                        setUser(null);
                    }
                } else {
                    setJwt(null);
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);
    
    const login = async (loginRequest: LoginRequest) => {
        try {
            const response = await api.auth.login(loginRequest);
            const token = response.data.accessToken;
            tokenStorage.setItem(TOKEN_KEY, token);
            setJwt(token);

            const userResponse = await api.auth.userInfo({
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(userResponse.data);

            const redirectTo = localStorage.getItem(REDIRECT_PATH_KEY) || AppRoutes.Home;
            localStorage.removeItem(REDIRECT_PATH_KEY);
            navigate(redirectTo);
        } catch (error) {
            tokenStorage.removeItem(TOKEN_KEY);
            setJwt(null);
            setUser(null);

            throw error;
        }
    };
    
    const logout = async () => {
        await api.auth.logout();
        setJwt(null);
        setUser(null);
        navigate(AppRoutes.Login);
    };
    
    return { user, login, logout, isLoading };
};