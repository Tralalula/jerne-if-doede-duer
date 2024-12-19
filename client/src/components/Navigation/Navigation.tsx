import { faGamepad, faCircleUser, faGear } from '@fortawesome/free-solid-svg-icons';
import DesktopNavigation from "./DesktopNavigation";
import HamburgerNavigation from "./HamburgerNavigation";

export default function Navigation() {

  return (
    <div>
      <DesktopNavigation />
      <HamburgerNavigation />
    </div>
  );
}
