import React from 'react';
import { Flex, Text, TextField } from '@radix-ui/themes';
import { useToast, api } from '../../import';
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import FormContainer from './FormContainer';

interface ChangePasswordFormData {
    currentPassword: string;
    newPassword: string;
}

const schema = yup.object({
    currentPassword: yup
        .string()
        .required("Nuværende adgangskode er påkrævet"),
    newPassword: yup
        .string()
        .required("Ny adgangskode er påkrævet")
        .min(6, "Adgangskoden skal være mindst 6 tegn lang")
        .matches(/[A-Z]/, "Adgangskoden skal indeholde mindst ét stort bogstav")
        .matches(/\d/, "Adgangskoden skal indeholde mindst ét tal")
        .matches(/[^A-Za-z0-9]/, "Adgangskoden skal indeholde mindst ét specialtegn")
}).required();

interface ChangePasswordFormProps {
    onSuccess?: () => void;
}

export default function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
    const { showToast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<ChangePasswordFormData>({
        resolver: yupResolver(schema)
    });

    const onSubmit: SubmitHandler<ChangePasswordFormData> = async (data) => {
        try {
            await api.auth.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            showToast("Succes", "Adgangskode ændret", "success");
            reset();
            onSuccess?.();
        } catch (error) {
            showToast("Fejl", "Kunne ikke ændre adgangskode", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormContainer onReset={reset} isSubmitting={isSubmitting}>
                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        Nuværende Adgangskode
                    </Text>
                    <TextField.Root
                        type="password"
                        variant="soft"
                        color="gray"
                        placeholder="Indtast nuværende adgangskode"
                        className={`border dark:border-gray5 ${errors.currentPassword ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                        {...register("currentPassword")}
                        disabled={isSubmitting}
                    />
                    {errors.currentPassword && (
                        <Flex mt="1" align="center" className="error-wrapper error-visible">
                            <Text color="red" size="1" className="flex gap-1 items-center">
                                <FontAwesomeIcon icon={faWarning} />
                                {errors.currentPassword.message}
                            </Text>
                        </Flex>
                    )}
                </Flex>

                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        Ny Adgangskode
                    </Text>
                    <TextField.Root
                        type="password"
                        variant="soft"
                        color="gray"
                        placeholder="Indtast ny adgangskode"
                        className={`border dark:border-gray5 ${errors.newPassword ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                        {...register("newPassword")}
                        disabled={isSubmitting}
                    />
                    {errors.newPassword && (
                        <Flex mt="1" align="center" className="error-wrapper error-visible">
                            <Text color="red" size="1" className="flex gap-1 items-center">
                                <FontAwesomeIcon icon={faWarning} />
                                {errors.newPassword.message}
                            </Text>
                        </Flex>
                    )}
                </Flex>
            </FormContainer>
        </form>
    );
}

