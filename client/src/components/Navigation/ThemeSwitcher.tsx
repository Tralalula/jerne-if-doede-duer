import { useAtom } from "jotai";
import { themeAtom } from "../import";
import themes from "daisyui/src/theming/themes";
import { Theme } from "daisyui";
import { FaPalette } from "react-icons/fa";
import { IconButton, Switch } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon } from "@fortawesome/free-solid-svg-icons";

export default function ThemeSwitcher() {
    const [theme, setTheme] = useAtom(themeAtom);
  
    const toggleTheme = () => {
      setTheme(theme === 'light' ? 'dark' : 'light');
    };
  
    return (
      <div className="flex items-center gap-4">
        <IconButton onClick={toggleTheme}>
            <FontAwesomeIcon icon={faMoon}/>
        </IconButton>
      </div>
    );
  };
