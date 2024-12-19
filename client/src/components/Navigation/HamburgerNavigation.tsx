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
    faBars,
    faX,
    faHistory
} from "@fortawesome/free-solid-svg-icons";
import { AccessLevel, AppRoutes } from "../import";

const HamburgerNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuthContext(); 
    const toggleMenu = () => setIsOpen(!isOpen);

    const isAdmin = user !== null && user.isAdmin;

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
                            to="game"
                            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500"
                        >
                            <FontAwesomeIcon icon={faGamepad} className="h-6 w-6" />
                            <span className="text-xs mt-1">Døde duer</span>
                        </Link>
                        <Link
                            to={AppRoutes.BoardHistory}
                            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500"
                        >
                            <FontAwesomeIcon icon={faHistory} className="h-6 w-6" />
                            <span className="text-xs mt-1">Historik</span>
                        </Link>
                        <Link
                            to={AppRoutes.MyTransactions}
                            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500"
                        >
                            <FontAwesomeIcon icon={faBank} className="h-6 w-6" />
                            <span className="text-xs mt-1">Betaling</span>
                        </Link>
                    </div>

                    <div className="w-6"></div>
                </div>

                {isOpen && (
                    <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray1 border-t dark:border-gray5 max-h-[80vh] overflow-y-auto shadow-lg">
                        <div className="p-4 space-y-4">
                            {/* Game Section */}
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">Spil</h3>
                                <nav className="space-y-1">
                                    <Link
                                        to="game"
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                        onClick={toggleMenu}
                                    >
                                        <FontAwesomeIcon icon={faGamepad} className="mr-3" />
                                        <span>Døde duer</span>
                                    </Link>
                                    <Link
                                        to={AppRoutes.BoardHistory}
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                        onClick={toggleMenu}
                                    >
                                        <FontAwesomeIcon icon={faGamepad} className="mr-3" />
                                        <span>Historik</span>
                                    </Link>
                                </nav>
                            </div>

                            {isAdmin && (
                                <div className="space-y-2">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Panel</h3>
                                    <nav className="space-y-1">
                                        <Link
                                            to={AppRoutes.PickWinnerSequence}
                                            className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                            onClick={toggleMenu}
                                        >
                                            <FontAwesomeIcon icon={faGamepad} className="mr-3" />
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

                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">Konto</h3>
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
                                        <FontAwesomeIcon icon={faBank} className="mr-3" />
                                        <span>Balance historik</span>
                                    </Link>
                                    <Link
                                        onClick={() => {
                                            logout();
                                            toggleMenu(); 
                                        }}
                                        to={AppRoutes.Login}
                                        className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/30 rounded-md"
                                    >
                                        <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-3" />
                                        <span>Log ud</span>
                                    </Link>
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