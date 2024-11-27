import { Flex } from "@radix-ui/themes";
import { ReactNode } from "react";
import Background from "./Background";

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
    <Flex className={className} align={align} justify={justify}
      style={{
        paddingTop: "var(--navbar-height)",
        height: `calc(100vh - var(--navbar-height))`,
      }}
       width="100vw">
      {background && <Background />}
      {children}
    </Flex>
  );
}