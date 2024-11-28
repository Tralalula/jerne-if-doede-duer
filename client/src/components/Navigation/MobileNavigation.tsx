import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tab } from "./types";
import { Flex, Text } from "@radix-ui/themes";

interface MobileNavigationProps {
    tabs: Tab[];
}
  
export default function MobileNavigation({ tabs }: MobileNavigationProps) {
    const navigate = useNavigate();

    const activeTab = location.pathname.split("/")[1] || tabs[0].name.toLowerCase();
    return (
      <div className="md:hidden fixed bottom-0 left-0 w-full backdrop-blur-md bg-whiteA5 dark:bg-gray1/90 border-t dark:border-t-zinc-700 shadow-md">
        <Flex className="py-2" justify='center'>
          {tabs.map((tab) => (
            <Flex key={tab.name} direction='column' flexGrow='1' align='center' className={`text-xs font-medium cursor-pointer ${
              activeTab === tab.name.toLowerCase()
                ? "text-blue-500"
                : "hover:text-blue-500"
            }`}
            onClick={() => navigate(`/${tab.name.toLowerCase()}`)}>
              <FontAwesomeIcon icon={tab.icon} className={`text-xl mb-1 ${
                  activeTab === tab.name.toLowerCase() ? "text-blue-500" : ""
                }`}/>
                <Text>
                  {tab.name}
                </Text>
            </Flex>
          ))}
      </Flex>
    </div>
  );

}