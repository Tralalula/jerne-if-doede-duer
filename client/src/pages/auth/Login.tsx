import { useAuth } from '../import';
import { LoginRequest } from '../../Api.ts';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Box, Button, Card, Container, Flex, Heading, IconButton, Link, Section, Skeleton, Text, TextField } from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faWarning } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const schema: yup.ObjectSchema<LoginRequest> = yup
    .object({
        email: yup.string().email("Email skal være gyldig").required("Email er påkrævet"),
        password: yup.string().min(6, "Adgangskode skal være mindst 6 tegn").required("Adgangskode er påkrævet"),
    })
    .required();

export default function LoginPage() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const [showPassword, setShowPassword] = useState(false);


    // evt custom logik?
    useEffect(() => {
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 250);
  
      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      };
    }, []);

    const { login } = useAuth();
    
    const { 
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) });
    
    const onSubmit: SubmitHandler<LoginRequest> = (data) => {
        toast.promise(login(data), {
            success: "Logget ind med succes",
            error: "Ugyldige loginoplysninger",
            loading: "Logger ind...",
        });
    };

    return (
        <Flex align="center" justify="center" height="100vh" width="100vw">
            <Container size="1" maxWidth='350px'>
                <Section>
                  <Card asChild variant="ghost" size="4" style={{ boxShadow: 'var(--shadow-5)'}}>
                    <form method="post" onSubmit={handleSubmit(onSubmit)}>
                    <Flex height="40px" mb="5" direction='column'>
                        <Heading as="h3" weight='bold' size="5" mt="-1">
                            <Skeleton loading={isLoading}>
                                Jerne IF Døde Duer
                            </Skeleton>
                        </Heading>
                        <Text color='gray' size='2'>
                            <Skeleton loading={isLoading}>
                                Log på din konto
                            </Skeleton>
                        </Text>
                    </Flex>
                      <Box mb="5">
                        <Flex direction="column">
                          <Text as="label" size="2" weight="medium" mb="2" htmlFor="email">
                            <Skeleton loading={isLoading}>Email</Skeleton>
                          </Text>
                          <Skeleton loading={isLoading}>
                            <TextField.Root
                              id="email"
                              type="text"
                              variant="soft"
                              color='gray'
                              placeholder="Din email adresse"
                              className={`border dark:border-gray5 ${errors.email ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                              {...register("email")}
                            />
                          </Skeleton>
                          {errors.email && (
                            <Flex mt='1' align='center'>
                                <Text color='red' size='1' className='flex gap-1 items-center' >
                                    <FontAwesomeIcon icon={faWarning}/>
                                    {errors.email.message}
                                </Text>
                            </Flex>
                            )}
                        </Flex>
                      </Box>

                      <Box mb="5" position="relative">
                        <Box position="absolute" top="0" right="0" style={{ marginTop: -2 }}>
                          <Link className='cursor-pointer hover:underline' onClick={() => navigate("/forgot")} size="2">
                            <Skeleton loading={isLoading}>Glemt adgangskode?</Skeleton>
                          </Link>
                        </Box>

                        <Flex direction="column">
                          <Text as="label" size="2" weight="medium" mb="2" htmlFor="password">
                            <Skeleton loading={isLoading}>Adgangskode</Skeleton>
                          </Text>
                          <Skeleton loading={isLoading}>
                            <TextField.Root
                              id="password"
                              variant="soft"
                              type={showPassword ? "text" : "password"}
                              color='gray'
                              placeholder="Din adgangskode"
                              className={`border dark:border-gray5 ${errors.password ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                              {...register("password")}>

                                <TextField.Slot side='right'>
                                    <IconButton size="1" variant="ghost" onClick={(event) => {
                                        event.preventDefault();
                                        setShowPassword(!showPassword);}}>
                                        <FontAwesomeIcon width={16} icon={showPassword ? faEyeSlash : faEye}/>
                                    </IconButton>
                                </TextField.Slot>
                            </TextField.Root>
                          </Skeleton>
                          {errors.password && (
                            <Flex mt='1' align='center'>
                                <Text color='red' size='1' className='flex gap-1 items-center' >
                                    <FontAwesomeIcon icon={faWarning}/>
                                    {errors.password.message}
                                </Text>
                            </Flex>
                            )}
                        </Flex>
                      </Box>

                      <Flex width='100%' justify="center" gap="3">
                        <Skeleton loading={isLoading}>
                          <Button className='w-full cursor-pointer' variant="solid" type="submit">
                            Log ind
                          </Button>
                        </Skeleton>
                      </Flex>
                    </form>
                  </Card>
                </Section>

        </Container>
      </Flex>
    );
}