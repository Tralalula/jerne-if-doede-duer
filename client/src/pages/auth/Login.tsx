import { Flex, Heading, Text } from "@radix-ui/themes";
import { LoginContainer, Page } from "../import";

export default function LoginPage() {
    return (
      <Page>
          <Flex className="text-center" gap='2' direction='column'>
            <Heading>
                Jerne IF Døde Duer
            </Heading>
            <Text color="gray" size='2'>
                Skriv din email og adgangskode for at logge på
            </Text>
              <LoginContainer/>
            </Flex>
      </Page>
    );
}