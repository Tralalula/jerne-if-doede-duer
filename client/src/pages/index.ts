export { default as HomePage } from "./Home";

//------- Boards -------//
export { default as GamePage } from './board/GamePage'
export { default as MyBoardHistory } from './board/MyBoardHistory'
export { default as WinnerSequence} from './winner-sequence/WinnerSequence'

//------- Auth -------//
export { default as LoginPage } from "./auth/Login";
export { default as ForgotPassword } from './auth/ForgotPassword';

//------- Transaction -------//
export { default as MyTransactionsPage } from './transaction/MyTransactionsPage';
export { default as AdminTransactionsPage } from './transaction/AdminTransactionsPage';

//------- User -------//
export { default as AdminUsersPage } from './user/AdminUsersPage';

//------- Balance history -------//
export { default as AdminBalanceHistoryPage } from './balancehistory/AdminBalanceHistoryPage';
export { default as AdminUserBalanceHistoryPage } from './balancehistory/AdminUserBalanceHistoryPage';
export { default as MyBalanceHistoryPage } from './balancehistory/MyBalanceHistoryPage';

//------- Profile -------//
export { default as ProfilePage } from './ProfilePage';

//------- Error -------//
export { default as ForbiddenPage } from "./error/ForbiddenPage";
export { default as NotFoundPage } from "./error/NotFoundPage";

//------- Rules -------//
export { default as RulesPage } from "./GameRules";