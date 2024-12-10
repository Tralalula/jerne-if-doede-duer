import React from 'react';
import { Flex, Text, TextField, Button } from '@radix-ui/themes';
import { useToast, api } from '../import';
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { useAtom } from 'jotai';
import { usersAtom, userPagingAtom } from '../import';

interface RegisterUserFormProps {
    onSuccess?: () => void;
    submitLabel?: string;
    cancelButton?: React.ReactNode;
}

interface RegisterUserFormData {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
}
const emailPattern = /^[a-zA-ZæøåÆØÅ0-9._%+-]+@[a-zA-ZæøåÆØÅ0-9.-]+\.[a-zA-Z]{2,}$/;

const schema = yup.object({
    email: yup
        .string()
        .required("Email er påkrævet")
        .matches(emailPattern, "Ugyldig email-adresse"),
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

export default function RegisterUserForm({ onSuccess, submitLabel = 'Opret', cancelButton }: RegisterUserFormProps) {
    const { showToast } = useToast();
    const [, setUsers] = useAtom(usersAtom);
    const [, setPaging] = useAtom(userPagingAtom);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<RegisterUserFormData>({
        resolver: yupResolver(schema),
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            phoneNumber: ''
        }
    });

    const onSubmit: SubmitHandler<RegisterUserFormData> = async (data) => {
        try {
            const registerResponse = await api.auth.register({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber
            });

            const userResponse = await api.user.getUser(registerResponse.data.id);
            setUsers(prev => [userResponse.data, ...prev]);
            setPaging(prev => ({
                ...prev,
                totalItems: prev.totalItems + 1
            }));

            showToast("Succes", "Bruger oprettet", "success");
            reset();
            onSuccess?.();
        } catch (error) {
            showToast("Fejl", "Kunne ikke oprette bruger", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Flex direction="column" gap="4">
                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        Email
                    </Text>
                    <TextField.Root
                        variant="soft"
                        color="gray"
                        placeholder="Indtast email"
                        className={`border dark:border-gray5 ${errors.email ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                        {...register("email")}
                        disabled={isSubmitting}
                    />
                    {errors.email && (
                        <Flex mt="1" align="center" className="error-wrapper error-visible">
                            <Text color="red" size="1" className="flex gap-1 items-center">
                                <FontAwesomeIcon icon={faWarning} />
                                {errors.email.message}
                            </Text>
                        </Flex>
                    )}
                </Flex>

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

                <Flex gap="3" mt="4" justify="end">
                    {cancelButton}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Opretter...' : submitLabel}
                    </Button>
                </Flex>
            </Flex>
        </form>
    );
}