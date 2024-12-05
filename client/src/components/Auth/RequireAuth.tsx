import { Navigate, RouteProps } from 'react-router-dom';
import { AppRoutes, AccessLevel, canAccess } from '../import'
import { useAuthContext } from '../../AuthContext';
import { REDIRECT_PATH_KEY } from '../../http';

type RequireAuthProps = Omit<RouteProps, 'element'> & {
    element: React.ReactElement;
    accessLevel?: AccessLevel;
};

export function RequireAuth({ element, accessLevel = AccessLevel.Protected }: RequireAuthProps) {
    const { user, isLoading } = useAuthContext();

    if (isLoading) return null;
    
    // Ikke logget ind - får 401 ved endpoints
    if (!user && accessLevel !== AccessLevel.Anonymous) {
        localStorage.setItem(REDIRECT_PATH_KEY, window.location.pathname);
        return <Navigate to={AppRoutes.Login} replace />
    }

    // Er logget ind men ikke rettigheder, f.eks. Player prøver at tilgå Admin side
    if (user && !canAccess(accessLevel, user)) {
        return <Navigate to={AppRoutes.Forbidden} replace />
    }

    return element;
}