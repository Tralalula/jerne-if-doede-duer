import { createContext, useContext } from 'react';
import { UserInfoResponse, LoginRequest } from './Api';

type AuthContextType = {
    user: UserInfoResponse | null;
    login: (loginRequest: LoginRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}