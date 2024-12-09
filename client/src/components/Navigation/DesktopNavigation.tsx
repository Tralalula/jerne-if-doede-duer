import { useNavigate } from "react-router-dom";
import { Tab } from "./types";
import { motion } from "framer-motion";
import { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { Flex, IconButton, Tooltip } from "@radix-ui/themes";
import AnimatedIconButton from "../Button/AnimatedIconButton";
import { useAuthContext } from "../../AuthContext";
import { canAccess } from "../import";

interface DesktopNavigationProps {
  tabs: Tab[];
}

export default function DesktopNavigation({ tabs }: DesktopNavigationProps) {
  let [activeTab, setActiveTab] = useState(tabs[0].path);
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();

  const visibleTabs = tabs.filter(tab => canAccess(tab.access, user))
  
  const changeTab = (tab: Tab) => {
    setActiveTab(tab.path);
    navigate(tab.path);
  };

  return (
    <div style={{height: '60px'}} className="hidden flex-no-wrap fixed top-0 w-full backdrop-blur-md z-30 bg-whiteA5 dark:bg-gray1/90 md:flex py-2 border-b dark:border-b-gray5 desktop-header">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center h-10 w-10">
          <div
            className="h-14 w-14 max-w-full cursor-pointer logo bg-contain"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-1">
          {visibleTabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => changeTab(tab)}
              className={`relative rounded-full px-3 z-10 py-1.5 text-sm font-medium transition duration-300 focus-visible:outline-2 ${
                activeTab === tab.path
                  ? "text-white"
                  : "dark:text-white text-black dark:hover:text-white/60 hover:text-gray-600"
              }`}
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {activeTab === tab.path && (
                <motion.span
                  layoutId="bubble"
                  className={`absolute inset-0 z-20 mix-blend-difference ${
                    activeTab === tab.path ? "dark:bg-white bg-black" : ""
                  }`}
                  style={{ borderRadius: 9999 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab.name}
            </button>
          ))}
        </div>
        <Flex className="ml-auto" align='center' gap='2'>
          <ThemeSwitcher />
          { user && (
          <AnimatedIconButton tooltipContent='Log ud' onClick={logout}>
              <FontAwesomeIcon className="text-gray5 dark:text-gray11" icon={faArrowRightFromBracket}/>
          </AnimatedIconButton>
          )}
        </Flex>
      </div>
    </div>
  );
}
