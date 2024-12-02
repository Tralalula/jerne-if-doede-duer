import { Flex } from "@radix-ui/themes";
import { ReactNode } from "react";

type PageContentProps = {
  children: ReactNode;
  className?: string;
};

export default function PageContent({ children, className = "" }: PageContentProps) {
  return (
    <Flex direction="column" className={`max-w-4xl w-full p-4 ${className}`}>
      {children}
    </Flex>
  );
}
