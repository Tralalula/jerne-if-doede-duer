import { faGamepad, faCircleUser, faGear, faSignOut } from '@fortawesome/free-solid-svg-icons';
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import { Tab } from './types';
import { AccessLevel } from '../import';

const tabs: Tab[] = [
  { name: "Spil", path: "/game", icon: faGamepad, access: AccessLevel.Protected },
  { name: "Konto", path: "/konto", icon: faCircleUser, access: AccessLevel.Protected },
  { name: "Kontakt", path: "/contact", icon: faGear, access: AccessLevel.Player },
  { name: "Panel", path: "/panel", icon: faGear, access: AccessLevel.Admin },
];

export default function Navigation() {
    return (
    <div>
        <DesktopNavigation tabs={tabs}/>
        <MobileNavigation tabs={tabs}/>
    </div>
  );

}