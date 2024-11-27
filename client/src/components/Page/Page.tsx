import { Flex } from "@radix-ui/themes";
import { ReactNode } from "react";
import Background from "./Background";

type PageProps = {
  children: ReactNode;
  background?: boolean;
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end";
  className?: string;
};

export default function Page({ children, background = true, align = "center", justify = "center", className = ""}: PageProps) {
  return (
    <Flex className={className} align={align} justify={justify} height="100vh" width="100vw">
      {background && <Background />}
      {children}
    </Flex>
  );
}