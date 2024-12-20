import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuthContext } from "../../AuthContext";
import {
    faArrowRightFromBracket,
    faBank,
    faGamepad,
    faGear, 
    faMoneyBill,
    faUser,
    faHistory,
    faTrophy,
    faBook,
    faBars,
    faX,
    faMoon,
    faSun
} from "@fortawesome/free-solid-svg-icons";
import { AppRoutes, themeAtom } from "../import";
import {useAtom} from "jotai/index";

const HamburgerNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuthContext();
    const [theme, setTheme] = useAtom(themeAtom);
    const toggleMenu = () => setIsOpen(!isOpen);
    
    const isAdmin = user !== null && user.isAdmin;

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={toggleMenu}
                />
            )}

            <NavigationMenu.Root className="md:hidden fixed bottom-0 w-full bg-whiteA5 dark:bg-gray1/90 z-50">
                <div className="flex justify-between items-center px-4 py-2 border-t dark:border-t-gray5">
                    <button
                        onClick={toggleMenu}
                        className="text-gray-700 dark:text-gray-200 focus:outline-none"
                    >
                        <FontAwesomeIcon
                            icon={isOpen ? faX : faBars}
                            className="h-6 w-6"
                        />
                    </button>

                    <div className="flex space-x-12">
                        <Link
                            to={AppRoutes.Game}
                            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500"
                        >
                            <FontAwesomeIcon icon={faGamepad} className="h-6 w-6" />
                            <span className="text-xs mt-1">Spil</span>
                        </Link>
                        <Link
                            to={AppRoutes.MyTransactions}
                            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500"
                        >
                            <FontAwesomeIcon icon={faBank} className="h-6 w-6" />
                            <span className="text-xs mt-1">Betaling</span>
                        </Link>
                        <Link
                            to={AppRoutes.BoardHistory}
                            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500"
                        >
                            <FontAwesomeIcon icon={faHistory} className="h-6 w-6" />
                            <span className="text-xs mt-1">Historik</span>
                        </Link>
                    </div>

                    <div className="w-6"></div>
                </div>

                {isOpen && (
                    <div className="absolute bottom-full left-0 w-full overflow-x-hidden bg-white dark:bg-gray1 border-t dark:border-gray5 max-h-[80vh] overflow-y-auto shadow-lg">
                        <div className="p-4 space-y-4">
                            {/* Spil sektion */}
                            <div className="space-y-2">
                                <h3 className="font-medium text-red11">Spil</h3>
                                <nav className="space-y-1">
                                    <Link
                                        to={AppRoutes.Game}
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                        onClick={toggleMenu}
                                    >
                                        <FontAwesomeIcon icon={faGamepad} className="mr-3" />
                                        <span>Spil nu</span>
                                    </Link>
                                    <Link
                                        to={AppRoutes.BoardHistory}
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                        onClick={toggleMenu}
                                    >
                                        <FontAwesomeIcon icon={faHistory} className="mr-3" />
                                        <span>Historik</span>
                                    </Link>
                                    <Link
                                        to={AppRoutes.Rules}
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                        onClick={toggleMenu}
                                    >
                                        <FontAwesomeIcon icon={faBook} className="mr-3" />
                                        <span>Regler</span>
                                    </Link>
                                </nav>
                            </div>

                            {/* Admin sektion */}
                            {isAdmin && (
                                <div className="space-y-2">
                                    <h3 className="font-medium text-red11">Panel</h3>
                                    <nav className="space-y-1">
                                        <Link
                                            to={AppRoutes.AdminPickWinnerSequence}
                                            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                            onClick={toggleMenu}
                                        >
                                            <FontAwesomeIcon icon={faTrophy} className="mr-3" />
                                            <span>Vindersekvens</span>
                                        </Link>
                                        <Link
                                            to={AppRoutes.AdminUsers}
                                            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                            onClick={toggleMenu}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="mr-3" />
                                            <span>Brugere</span>
                                        </Link>
                                        <Link
                                            to={AppRoutes.AdminGameHistory}
                                            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                            onClick={toggleMenu}
                                        >
                                            <FontAwesomeIcon icon={faGamepad} className="mr-3" />
                                            <span>Spil</span>
                                        </Link>
                                        <Link
                                            to={AppRoutes.AdminTransactions}
                                            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                            onClick={toggleMenu}
                                        >
                                            <FontAwesomeIcon icon={faBank} className="mr-3" />
                                            <span>Transaktioner</span>
                                        </Link>
                                        <Link
                                            to={AppRoutes.AdminBalanceHistory}
                                            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                            onClick={toggleMenu}
                                        >
                                            <FontAwesomeIcon icon={faMoneyBill} className="mr-3" />
                                            <span>Balance historik</span>
                                        </Link>
                                    </nav>
                                </div>
                            )}

                            {/* Konto sektion */}
                            <div className="space-y-2">
                                <h3 className="font-medium text-red11">Konto</h3>
                                <nav className="space-y-1">
                                    <Link
                                        to={AppRoutes.Profile}
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                        onClick={toggleMenu}
                                    >
                                        <FontAwesomeIcon icon={faGear} className="mr-3" />
                                        <span>Indstillinger</span>
                                    </Link>
                                    <Link
                                        to={AppRoutes.MyTransactions}
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                        onClick={toggleMenu}
                                    >
                                        <FontAwesomeIcon icon={faBank} className="mr-3" />
                                        <span>Transaktion</span>
                                    </Link>
                                    <Link
                                        to={AppRoutes.MyBalanceHistory}
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                        onClick={toggleMenu}
                                    >
                                        <FontAwesomeIcon icon={faMoneyBill} className="mr-3" />
                                        <span>Balance historik</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            toggleTheme();
                                            toggleMenu();
                                        }}
                                        className="flex w-full items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                    >
                                        <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} className="mr-3" />
                                        <span>{theme === "light" ? "Mørk tema" : "Lys tema"}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            logout();
                                            toggleMenu();
                                        }}
                                        className="flex w-full items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                    >
                                        <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-3" />
                                        <span>Log ud</span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </NavigationMenu.Root>
        </>
    );
};

export default HamburgerNavigation;