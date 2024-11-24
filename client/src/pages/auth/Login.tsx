import { Flex } from "@radix-ui/themes";
import { LoginContainer } from "../import";

export default function LoginPage() {
    return (
      <Flex className="container h-screen max-w-none px-0 -mt-10" align='center' justify='center'>
        <div className="lg:p-8">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Jerne IF Døde Duer
              </h1>
              <p className="text-sm text-muted-foreground dark:text-mauve11">
                Skriv din email og adgangskode for at logge på
              </p>
              <LoginContainer/>

            </div>
        </div>
              
      </Flex>
    );
}