import { faGamepad, faCircleUser, faGear } from '@fortawesome/free-solid-svg-icons';
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import { Tab } from './types';
import { AccessLevel } from '../import';

const tabs: Tab[] = [
  { name: "Spil", path: "/game", icon: faGamepad },
  { name: "Konto", path: "/konto", icon: faCircleUser },
  { name: "Kontakt", path: "/contact", icon: faGear },
  { name: "Panel", path: "/panel", icon: faGear },
];


export default function Navigation() {

  return (
    <div>
      <DesktopNavigation />
      <MobileNavigation tabs={tabs} />
    </div>
  );
}
