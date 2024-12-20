import React, { forwardRef } from "react";
import classNames from "classnames";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ActionItemProps {
    className?: string;
    title: string;
    children?: React.ReactNode;
    onClick?: () => void;
    icon?: IconDefinition;
}

export const ActionItem = forwardRef<HTMLButtonElement, ActionItemProps>(
    ({ className, children, title, icon, onClick, ...props }, ref) => (
        <li className="w-full">
            <NavigationMenu.Link asChild>
                <button
                    className={classNames(
                        "w-full",
                        className
                    )}
                    onClick={onClick}
                    ref={ref}
                    type="button"
                    {...props}
                >
                    <div className="w-full ListItemLink">
                        <div className="flex items-start">
                            {icon && (
                                <FontAwesomeIcon
                                    icon={icon}
                                    className="mr-2 text-red11"
                                />
                            )}
                            <div>
                                <div className="ListItemHeading text-[15px] leading-none">{title}</div>
                                <p className="ListItemText">{children}</p>
                            </div>
                        </div>
                    </div>
                </button>
            </NavigationMenu.Link>
        </li>
    )
);


ActionItem.displayName = "ActionItem";