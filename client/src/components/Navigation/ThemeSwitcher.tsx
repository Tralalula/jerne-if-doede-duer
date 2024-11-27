import { useAtom } from "jotai";
import { themeAtom } from "../import";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import AnimatedIconButton from "../Button/AnimatedIconButton";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <AnimatedIconButton tooltipContent={theme === "light" ? "Mørk tema" : "Lys tema"} onClick={toggleTheme}>
      <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun}
        className="text-gray5 dark:text-gray11"/>
    </AnimatedIconButton>
  );
}
