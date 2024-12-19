import {useEffect} from "react";
import {useAtom} from "jotai";
import { Routes, Route } from "react-router-dom";
import { ForgotPassword, GamePage, WinnerSequence, LoginPage, ForbiddenPage, MyBoardHistory, NotFoundPage, MyTransactionsPage, AdminTransactionsPage, AdminUsersPage, AdminBalanceHistoryPage, ProfilePage, AdminUserBalanceHistoryPage, MyBalanceHistoryPage, RulesPage, GameHistoryPage, GameBoardHistoryPage } from "./pages/index";
import { Navigation, DaisyToaster, RequireAuth } from "./components/index";
import { themeAtom } from "./atoms/index";
import { AppRoutes, AccessLevel } from "./helpers";
import { Theme } from '@radix-ui/themes';
import { ToastProvider, useAuth } from "./hooks";
import { AuthContext } from './AuthContext';

const App = () => {
  const [theme] = useAtom(themeAtom);
  const auth = useAuth();

  useEffect(() => {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
  }, [theme])

  return (
  <AuthContext.Provider value={auth}>
    <Theme appearance={theme} accentColor="red" panelBackground="translucent">
      <ToastProvider>
      {auth.user && (<Navigation /> )}
        <DaisyToaster />
          <Routes>
              <Route path={AppRoutes.NotFound} element={<RequireAuth accessLevel={AccessLevel.Anonymous} element={<NotFoundPage />} />} />
              <Route path={AppRoutes.Forbidden} element={<RequireAuth accessLevel={AccessLevel.Anonymous} element={<ForbiddenPage />} />} />
              
              <Route path={AppRoutes.Rules} element={<RequireAuth accessLevel={AccessLevel.Anonymous} element={<RulesPage />} />} />
              
              <Route path={AppRoutes.Home} element={<RequireAuth accessLevel={AccessLevel.Protected} element={<GamePage />} />} />
              <Route path={AppRoutes.Home} element={<RequireAuth accessLevel={AccessLevel.Anonymous} element={<LoginPage />} />} />

              <Route path={AppRoutes.Login} element={<RequireAuth accessLevel={AccessLevel.Anonymous} element={<LoginPage />} />} />
              <Route path={AppRoutes.Forgot} element={<RequireAuth accessLevel={AccessLevel.Anonymous} element={<ForgotPassword />} />} />
              <Route path={AppRoutes.Game} element={<RequireAuth accessLevel={AccessLevel.Protected} element={<GamePage />} />} />
              <Route path={AppRoutes.MyTransactions} element={<RequireAuth accessLevel={AccessLevel.Protected} element={<MyTransactionsPage />} />} />
              <Route path={AppRoutes.AdminTransactions} element={<RequireAuth accessLevel={AccessLevel.Admin} element={<AdminTransactionsPage />} />} />
              <Route path={AppRoutes.AdminUsers} element={<RequireAuth accessLevel={AccessLevel.Admin} element={<AdminUsersPage />} />} />
              <Route path={AppRoutes.MyBalanceHistory} element={<RequireAuth accessLevel={AccessLevel.Protected} element={<MyBalanceHistoryPage />} />} />
              <Route path={AppRoutes.AdminBalanceHistory} element={<RequireAuth accessLevel={AccessLevel.Admin} element={<AdminBalanceHistoryPage />} />} />
              <Route path={AppRoutes.AdminUserBalanceHistory} element={<RequireAuth accessLevel={AccessLevel.Admin} element={<AdminUserBalanceHistoryPage />} />} />
              <Route path={AppRoutes.Profile} element={<RequireAuth accessLevel={AccessLevel.Protected} element={<ProfilePage />} />} />
              <Route path={AppRoutes.AdminPickWinnerSequence} element={<RequireAuth accessLevel={AccessLevel.Admin} element={<WinnerSequence />} />} />

              <Route path={AppRoutes.AdminGameHistory} element={<RequireAuth accessLevel={AccessLevel.Admin} element={<GameHistoryPage />} />} />
              <Route path={AppRoutes.AdminGameBoardHistory} element={<RequireAuth accessLevel={AccessLevel.Admin} element={<GameBoardHistoryPage />} />} />

              <Route path={AppRoutes.BoardHistory} element={<RequireAuth accessLevel={AccessLevel.Protected} element={<MyBoardHistory />} />} />

          </Routes>
        </ToastProvider>
      </Theme>
    </AuthContext.Provider>
  );
};

export default App;
