import {useEffect} from "react";
import {useAtom} from "jotai";
import { Routes, Route } from "react-router-dom";
import { HomePage, LoginPage } from "./pages/index";
import { Navigation, DaisyToaster } from "./components/index";
import { themeAtom } from "./atoms/index";
import { AppRoutes } from "./helpers/index";

const App = () => {

  const [theme] = useAtom(themeAtom);

  useEffect(() => {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
  }, [theme])

  return (
    <>
      <Navigation/>
      <DaisyToaster />
      <Routes>
          <Route path={AppRoutes.Home} element={<HomePage />} />
          <Route path={AppRoutes.Login} element={<LoginPage />} />
      </Routes>
    </>
  );
};

export default App;
