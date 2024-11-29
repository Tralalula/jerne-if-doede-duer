import { Flex } from "@radix-ui/themes";
import { ReactNode } from "react";
import Background from "./Background";
import clsx from "clsx";

import './Page.css'

type PageProps = {
  children: ReactNode;
  background?: boolean;
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end";
  className?: string;
};

export default function Page({ children, background = true, align = "center", justify = "center", className = ""}: PageProps) {
  return (
    <Flex className={clsx(
      className,
      "h-[calc(100vh-var(--navbar-height)*2.95)] md:h-[100vh]"
    )} align={align} justify={justify}
      style={{ paddingTop: "var(--navbar-height)" }}
       width="100vw"
       height='100vh'>
      {background && <Background />}
      {children}
    </Flex>
  );
}