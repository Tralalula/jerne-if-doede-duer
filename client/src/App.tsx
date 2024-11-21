import {useEffect} from "react";
import {useAtom} from "jotai";
import { Routes, Route } from "react-router-dom";
import { HomePage, LoginPage } from "./pages/index";
import { Navigation, DaisyToaster } from "./components/index";
import { themeAtom } from "./atoms/index";
import { AppRoutes } from "./helpers/index";
import { Theme } from '@radix-ui/themes';

const App = () => {
  const [theme] = useAtom(themeAtom);

  useEffect(() => {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
  }, [theme])

  return (
    <>
    <Theme appearance={theme} accentColor="blue">
      <Navigation />
      <DaisyToaster />
        <Routes>
            <Route path={AppRoutes.Home} element={<HomePage />} />
            <Route path={AppRoutes.Login} element={<LoginPage />} />
        </Routes>
      </Theme>
    </>
  );
};

export default App;
