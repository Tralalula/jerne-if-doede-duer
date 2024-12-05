import { useAuth } from '../import';
import { LoginRequest } from '../../Api.ts';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { Box, Card, Container, Flex, IconButton, Link, Section,  Skeleton, Text, TextField, Tooltip } from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faWarning } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import LoadingButton from '../Button/LoadingButton.tsx';

import { useToast } from '../import';
import './LoginContainer.css'

const schema: yup.ObjectSchema<LoginRequest> = yup
    .object({
        email: yup.string().email("Email skal være gyldig").required("Email er påkrævet"),
        password: yup.string().min(6, "Adgangskode skal være mindst 6 tegn").required("Adgangskode er påkrævet"),
        deviceName: yup.string().required()
    })
    .required();

export default function LoginContainer() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const [showPassword, setShowPassword] = useState(false);

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const { showToast } = useToast();

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
    
    const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
        setIsLoggingIn(true);
    
        showToast("Logger på",  "Vent venligst...", "info");
    
        try {
            await login(data);
            showToast("Fedt! Du kom ind", "Logget ind med succes", "success");
        } catch (error) {
            showToast("Ups! En fejl skete", "Ugyldige loginoplysninger", "error");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <Flex align="center" justify="center">
            <Container size="1">
                <Section>
                  <Card className='p-5 bg-whiteA5 dark:bg-gray1/75 backdrop-blur-md' asChild variant="ghost" size="1" style={{ boxShadow: 'var(--shadow-5)'}}>
                    <form method="post" onSubmit={handleSubmit(onSubmit)}>
                      <input type="hidden" {...register("deviceName")} value={window.navigator.userAgent} />
                      <Box mb="5">
                        <Flex direction="column">
                          <Text as="label" size="2" weight="medium" mb="2" htmlFor="email">
                            <Skeleton loading={isLoading}>Email</Skeleton>
                          </Text>
                          <Skeleton loading={isLoading}>
                            <TextField.Root
                              id="email"
                              type="email"
                              variant="soft"
                              color='gray'
                              placeholder="Din email adresse"
                              className={`border dark:border-gray5 ${errors.email ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                              {...register("email")}
                            />
                          </Skeleton>
                          <Flex mt="1" align="center" className={`error-wrapper ${errors.email ? 'error-visible' : ''}`}>
                                <Text color="red" size="1" className="flex gap-1 items-center">
                                    <FontAwesomeIcon icon={faWarning} />
                                    {errors.email?.message}
                                </Text>
                            </Flex>
                        </Flex>
                      </Box>

                      <Box mb="2" position="relative">
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
                            <Tooltip content={`${showPassword ? 'Skjul adgangskode' : 'Vis adgangskode'}`}>
                                <TextField.Slot side='right'>
                                    <IconButton type="button" size="1" variant="ghost" onClick={(event) => {
                                        event.preventDefault();
                                        setShowPassword(!showPassword);}}>
                                        <FontAwesomeIcon width={16} icon={showPassword ? faEyeSlash : faEye}/>
                                    </IconButton>
                                </TextField.Slot>
                            </Tooltip>
                            </TextField.Root>
                          </Skeleton>
                            <Flex mt="1" align="center" className={`error-wrapper ${errors.password ? 'error-visible' : ''}`}>
                                <Text color="red" size="1" className="flex gap-1 items-center">
                                    <FontAwesomeIcon icon={faWarning} />
                                    {errors.password?.message}
                                </Text>
                            </Flex>
                        </Flex>
                      </Box>

                      <Flex width='100%' justify="center">
                          <LoadingButton skeleton={isLoading} type='submit' isLoading={isLoggingIn}>
                              Log på
                          </LoadingButton>
                      </Flex>
                    </form>
                  </Card>
                </Section>

        </Container>
      </Flex>
    );
}