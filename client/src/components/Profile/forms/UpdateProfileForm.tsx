import React from 'react';
import { Flex, Text, TextField } from '@radix-ui/themes';
import { useToast, api } from '../../import';
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import FormContainer from './FormContainer';

interface UpdateProfileFormData {
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
}

const schema = yup.object({
    firstName: yup
        .string()
        .required("Fornavn er påkrævet")
        .max(50, "Fornavn kan maksimalt være 50 tegn"),
    lastName: yup
        .string()
        .required("Efternavn er påkrævet")
        .max(50, "Efternavn kan maksimalt være 50 tegn"),
    phoneNumber: yup
        .string()
        .max(20, "Telefonnummer kan maksimalt være 20 tegn")
        .matches(/^\+?[0-9\s-]*$/, "Ugyldigt telefonnummer")
        .transform((value, originalValue) => originalValue === '' ? null : value)
        .nullable()
        .notRequired()
}).required();

export default function UpdateProfileForm({ onSuccess }: { onSuccess?: () => void }) {
    const { showToast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<UpdateProfileFormData>({
        resolver: yupResolver(schema),
        mode: 'onSubmit',
        defaultValues: {
            firstName: '',
            lastName: '',
            phoneNumber: ''
        }
    });

    const onSubmit: SubmitHandler<UpdateProfileFormData> = async (data) => {
        try {
            await api.auth.updateProfile({
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber, 
            });

            showToast("Succes", "Profil opdateret", "success");
            reset();
            onSuccess?.();
        } catch (error) {
            showToast("Fejl", "Kunne ikke opdatere profil", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormContainer onReset={reset} isSubmitting={isSubmitting}>
                <Flex gap="3">
                    <Flex direction="column" className="flex-1">
                        <Text as="label" size="2" weight="medium" mb="2">
                            Fornavn
                        </Text>
                        <TextField.Root
                            variant="soft"
                            color="gray"
                            placeholder="Indtast fornavn"
                            className={`border dark:border-gray5 ${errors.firstName ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                            {...register("firstName")}
                            disabled={isSubmitting}
                        />
                        {errors.firstName && (
                            <Flex mt="1" align="center" className="error-wrapper error-visible">
                                <Text color="red" size="1" className="flex gap-1 items-center">
                                    <FontAwesomeIcon icon={faWarning} />
                                    {errors.firstName.message}
                                </Text>
                            </Flex>
                        )}
                    </Flex>

                    <Flex direction="column" className="flex-1">
                        <Text as="label" size="2" weight="medium" mb="2">
                            Efternavn
                        </Text>
                        <TextField.Root
                            variant="soft"
                            color="gray"
                            placeholder="Indtast efternavn"
                            className={`border dark:border-gray5 ${errors.lastName ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                            {...register("lastName")}
                            disabled={isSubmitting}
                        />
                        {errors.lastName && (
                            <Flex mt="1" align="center" className="error-wrapper error-visible">
                                <Text color="red" size="1" className="flex gap-1 items-center">
                                    <FontAwesomeIcon icon={faWarning} />
                                    {errors.lastName.message}
                                </Text>
                            </Flex>
                        )}
                    </Flex>
                </Flex>

                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        Telefonnummer (valgfrit)
                    </Text>
                    <TextField.Root
                        variant="soft"
                        color="gray"
                        placeholder="Indtast telefonnummer"
                        className={`border dark:border-gray5 ${errors.phoneNumber ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                        {...register("phoneNumber")}
                        disabled={isSubmitting}
                    />
                    {errors.phoneNumber && (
                        <Flex mt="1" align="center" className="error-wrapper error-visible">
                            <Text color="red" size="1" className="flex gap-1 items-center">
                                <FontAwesomeIcon icon={faWarning} />
                                {errors.phoneNumber.message}
                            </Text>
                        </Flex>
                    )}
                </Flex>
            </FormContainer>
        </form>
    );
}