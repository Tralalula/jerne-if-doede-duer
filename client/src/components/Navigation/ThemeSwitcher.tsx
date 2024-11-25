import { useAtom } from "jotai";
import { themeAtom } from "../import";
import { Tooltip, IconButton } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

import './ThemeSwitcher.css'

export default function ThemeSwitcher() {
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Tooltip content={`${theme === "light" ? "Mørk tema" : "Lys tema"}`}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="inline-block"
      >
        <IconButton variant="outline"
          className="theme-button cursor-pointer shadow-none p-2 bg-transparent transition-colors duration-300"
          onClick={toggleTheme}
        >
          <motion.div
            key={theme}
            initial={{
              opacity: 0,
              scale: 0.8,
              rotate: theme === "light" ? -90 : 90,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              rotate: theme === "light" ? 90 : -90,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={theme === "light" ? faMoon : faSun}
              className="text-gray5 dark:text-gray11 transition-colors duration-300"
            />
          </motion.div>
        </IconButton>
      </motion.div>
    </Tooltip>
  );
}
