import { faGamepad, faCircleUser, faGear, faSignOut } from '@fortawesome/free-solid-svg-icons';
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import { Tab } from './types';

const tabs: Tab[] = [
  { name: "Spil", path: "/game", icon: faGamepad },
  { name: "Konto", path: "/konto", icon: faCircleUser },
  { name: "Kontakt", path: "/contact", icon: faGear },
  { name: "Panel", path: "/panel", icon: faGear },
];

export default function Navigation() {
    return (
    <div>
        <DesktopNavigation tabs={tabs}/>
        <MobileNavigation tabs={tabs}/>
    </div>
  );

}