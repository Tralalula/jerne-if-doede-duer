import React, { forwardRef } from "react";
import classNames from "classnames";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Link } from "react-router-dom";

interface ListItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  className?: string;
  title: string;
  href: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  icon?: IconDefinition;
}

export const ListItem = forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, children, title, href, icon, onClick, ...props }, ref) => (
    <li>
      <NavigationMenu.Link asChild>
        <Link
          to={href}
          className={classNames("ListItemLink", className)}
          onClick={onClick}
          ref={ref}
          {...props}
        >
          <div className="flex items-start">
            {icon && (
              <FontAwesomeIcon
                icon={icon}
                className="mr-2 text-red11"
              />
            )}
            <div>
              <div className="ListItemHeading">{title}</div>
              <p className="ListItemText">{children}</p>
            </div>
          </div>
        </Link>
      </NavigationMenu.Link>
    </li>
  )
);

ListItem.displayName = "ListItem";
