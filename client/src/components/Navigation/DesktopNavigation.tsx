import { useNavigate } from "react-router-dom";
import { Tab } from "./types";

import { motion } from "framer-motion";

import './DesktopNavigation.css'
import { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";

interface DesktopNavigationProps {
  tabs: Tab[];
}

export default function DesktopNavigation({ tabs }: DesktopNavigationProps) {
  let [activeTab, setActiveTab] = useState(tabs[0].path);
  const navigate = useNavigate();

  const changeTab = (tab: Tab) => {
    setActiveTab(tab.path)
    navigate(tab.path)
  }

  return (
    <div className="hidden md:flex justify-center border-b dark:border-b-zinc-700 desktop-header space-x-4">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => changeTab(tab)}
          className={`${
            activeTab === tab.path ? "" : "hover:text-zinc-500 dark:hover:text-white/60"
          } relative rounded-full px-3 py-1.5 text-sm text-black font-medium dark:text-white outline-sky-400 transition focus-visible:outline-2`}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {activeTab === tab.path && (
            <motion.span
              layoutId="bubble"
              className="absolute inset-0 z-10 bg-white mix-blend-difference"
              style={{ borderRadius: 9999 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {tab.name}
        </button>
      ))}
      <ThemeSwitcher/>
    </div>
  )
}