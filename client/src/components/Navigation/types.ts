import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { AccessLevel } from "../import";

export interface Tab {
    name: string;
    path: string;
    icon: IconDefinition;
    access: AccessLevel;
  }