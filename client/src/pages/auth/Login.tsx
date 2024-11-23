import { LoginContainer } from '../import';
import { LoginRequest } from '../../Api.ts';
import * as yup from "yup";

export default function LoginPage() {
    return (
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:px-0">
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
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
        </div>
      </div>
    );
}