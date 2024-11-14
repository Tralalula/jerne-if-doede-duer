import { useAtom } from "jotai";
import { ThemeAtom } from "../../atoms/ThemeAtom";
import themes from "daisyui/src/theming/themes";
import { Theme } from "daisyui";
import { FaPalette } from "react-icons/fa";

export default function ThemeSwitcher() {
    const [theme, setTheme] = useAtom(ThemeAtom);

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost m-1">
                <FaPalette className="w-5 h-5" />
                <svg
                    width="12px"
                    height="12px"
                    className="inline-block h-2 w-2 fill-current opacity-60 ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 2048 2048">
                    <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                </svg>
            </div>
            <ul
                tabIndex={0}
                className="dropdown-content pr-4 pl-4 pt-2 pb-2 bg-base-200 text-base-content rounded-box top-px h-[28.6rem] max-h-[calc(100vh-10rem)] w-56 overflow-y-auto border border-white/5 shadow-2xl outline outline-1 outline-black/5 mt-16">
                <div className="grid grid-cols-1 gap-3">
                    {(Object.keys(themes) as Array<Theme>).map((themeName) => (
                        <button key={themeName} className="outline-base-content text-start outline-offset-4" data-set-theme={themeName} onClick={() => setTheme(themeName)}>
                    <span className="bg-base-100 rounded-btn text-base-content block w-full cursor-pointer font-sans" data-theme={themeName}>
                        <span className="grid grid-cols-5 grid-rows-3">
                        <span className="col-span-5 row-span-3 row-start-1 flex items-center gap-2 px-4 py-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={`${theme !== themeName && "invisible"} h-3 w-3 shrink-0`}>
                            <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path>
                            </svg>
                            <span className="flex-grow text-sm">{themeName}</span>
                            <span className="flex h-full shrink-0 flex-wrap gap-1">
                            <span className="bg-primary rounded-badge w-2"/>
                            <span className="bg-secondary rounded-badge w-2"/>
                            <span className="bg-accent rounded-badge w-2"/>
                            <span className="bg-neutral rounded-badge w-2"/>
                            </span>
                        </span>
                        </span>
                    </span>
                        </button>
                    ))}
                </div>
            </ul>
        </div>
    );
}