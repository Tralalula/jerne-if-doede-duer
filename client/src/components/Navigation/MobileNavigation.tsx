import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tab } from "./types";

interface MobileNavigationProps {
    tabs: Tab[];
}
  
export default function MobileNavigation({ tabs }: MobileNavigationProps) {
    const navigate = useNavigate();

    const activeTab = location.pathname.split("/")[1] || tabs[0].name.toLowerCase();
    return (
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-900 border-t dark:border-t-zinc-700 shadow-md">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`flex flex-col flex-grow items-center text-xs font-medium cursor-pointer transition ${
              activeTab === tab.name.toLowerCase()
                ? "text-blue-500"
                : "text-gray-600 dark:text-gray-200 hover:text-blue-500"
            }`}
            onClick={() => navigate(`/${tab.name.toLowerCase()}`)}
          >
            <FontAwesomeIcon
              icon={tab.icon}
              className={`text-xl mb-1 transition ${
                activeTab === tab.name.toLowerCase() ? "text-blue-500" : "text-gray-600 dark:text-gray-200"
              }`}
            />
            <span>{tab.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

}