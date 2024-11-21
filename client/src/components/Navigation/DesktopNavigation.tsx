import { useNavigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import ThemeSwitcher from "./ThemeSwitcher";
import { Tab } from "./types";

interface DesktopNavigationProps {
  tabs: Tab[];
}

export default function DesktopNavigation({ tabs }: DesktopNavigationProps) {
  const navigate = useNavigate();

    return (
      <nav className="hidden md:flex justify-center border-b dark:border-b-zinc-700 py-2 space-x-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-500 text-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-blue-500'
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
        <ThemeSwitcher/>
      </nav>
  );

}