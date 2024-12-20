import React, { useState } from 'react';
import { Flex, Text, TextField, Tooltip, IconButton } from '@radix-ui/themes';
import { useToast, api } from '../../import';
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import FormContainer from './FormContainer';

const emailPattern = /^[a-zA-ZæøåÆØÅ0-9._%+-]+@[a-zA-ZæøåÆØÅ0-9.-]+\.[a-zA-Z]{2,}$/;

interface ChangeEmailFormData {
    newEmail: string;
    password: string;
}

const schema = yup.object({
    newEmail: yup
        .string()
        .required("Email er påkrævet")
        .matches(emailPattern, "Ugyldig email-adresse"),
    password: yup
        .string()
        .required("Adgangskode er påkrævet")
}).required();

interface ChangeEmailFormProps {
    onSuccess?: () => void;
}

export default function ChangeEmailForm({ onSuccess }: ChangeEmailFormProps) {
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<ChangeEmailFormData>({
        resolver: yupResolver(schema)
    });

    const onSubmit: SubmitHandler<ChangeEmailFormData> = async (data) => {
        try {
            await api.auth.initiateEmailChange({
                newEmail: data.newEmail,
                password: data.password
            });

            showToast("Succes", "Bekræftelsesmail sendt", "success");
            reset();
            onSuccess?.();
        } catch (error) {
            showToast("Fejl", "Kunne ikke initialisere email-ændring", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormContainer onReset={reset} isSubmitting={isSubmitting}>
                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        Ny Email
                    </Text>
                    <TextField.Root
                        variant="soft"
                        color="gray"
                        placeholder="Indtast ny email"
                        className={`border dark:border-gray5 ${errors.newEmail ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                        {...register("newEmail")}
                        disabled={isSubmitting}
                    />
                    {errors.newEmail && (
                        <Flex mt="1" align="center" className="error-wrapper error-visible">
                            <Text color="red" size="1" className="flex gap-1 items-center">
                                <FontAwesomeIcon icon={faWarning} />
                                {errors.newEmail.message}
                            </Text>
                        </Flex>
                    )}
                </Flex>

                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        Adgangskode
                    </Text>
                    <TextField.Root
                        type={showPassword ? "text" : "password"}
                        variant="soft"
                        color="gray"
                        placeholder="Indtast adgangskode"
                        className={`border dark:border-gray5 ${errors.password ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                        {...register("password")}
                        disabled={isSubmitting}
                    >
                        <Tooltip content={showPassword ? "Skjul adgangskode" : "Vis adgangskode"}>
                            <TextField.Slot side='right'>
                                <IconButton
                                    type="button"
                                    size="1"
                                    variant="ghost"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        setShowPassword((prev) => !prev);
                                    }}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </IconButton>
                            </TextField.Slot>
                        </Tooltip>
                    </TextField.Root>
                    {errors.password && (
                        <Flex mt="1" align="center" className="error-wrapper error-visible">
                            <Text color="red" size="1" className="flex gap-1 items-center">
                                <FontAwesomeIcon icon={faWarning} />
                                {errors.password.message}
                            </Text>
                        </Flex>
                    )}
                </Flex>
            </FormContainer>
        </form>
    );
}