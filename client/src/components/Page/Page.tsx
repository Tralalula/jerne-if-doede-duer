import { Box, Container } from "@radix-ui/themes";
import { ReactNode } from "react";

type PageProps = {
  children: ReactNode;
};

export default function Page({ children }: PageProps) {
  return (
    <Box>
      <Container>
        {children}
      </Container>
    </Box>
  );
}