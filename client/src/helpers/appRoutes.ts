export const AppRoutes = {
    NotFound: "*",
    Forbidden: "/forbidden",
    Home: "/",
    Login: "/login",
    Forgot: "/forgot",
    Game: "/game",
    MyTransactions: '/transactions',
    AdminTransactions: '/admin/transactions',
    AdminUsers: '/admin/users',
    MyBalanceHistory: '/balance-history',
    AdminBalanceHistory: '/admin/balance-history',
    AdminUserBalanceHistory: '/admin/balance-history/:userId',
    PickWinnerSequence: '/admin/winner-sequence',
    GameHistory: '/admin/game/history',

    BoardHistory: '/board/history',
    Profile: '/me',
} as const;