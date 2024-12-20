import React from 'react';
import { Flex, Text, TextField, Button } from '@radix-ui/themes';
import { useToast, api } from '../import';
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { useAtom } from 'jotai';
import { usersAtom } from '../import';
import { UserDetailsResponse } from '../import';

interface UpdateUserFormProps {
    user: UserDetailsResponse;
    onSuccess?: () => void;
    onCancel?: () => void;
    submitLabel?: string;
    cancelButton?: React.ReactNode;
}

interface UpdateUserFormData {
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
    newEmail?: string | null;
}

const emailPattern = /^[a-zA-ZæøåÆØÅ0-9._%+-]+@[a-zA-ZæøåÆØÅ0-9.-]+\.[a-zA-Z]{2,}$/;

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
        .notRequired(),
    newEmail: yup
        .string()
        .transform((value) => value === '' ? null : value) 
        .nullable()
        .notRequired()
        .matches(emailPattern, "Ugyldig email-adresse")
}).required();

export default function UpdateUserForm({ user, onSuccess, onCancel, submitLabel = 'Gem', cancelButton }: UpdateUserFormProps) {
    const { showToast } = useToast();
    const [users, setUsers] = useAtom(usersAtom);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<UpdateUserFormData>({
        resolver: yupResolver(schema),
        mode: 'onSubmit',
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber || '',
            newEmail: ''
        }
    });

    const onSubmit: SubmitHandler<UpdateUserFormData> = async (data) => {
        try {
            const response = await api.user.updateUser(user.id, {
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                newEmail: data.newEmail || null
            });

            setUsers(users.map(u => u.id === user.id ? response.data : u));

            showToast("Succes", "Bruger opdateret", "success");
            onSuccess?.();
            reset();
        } catch (error) {
            showToast("Fejl", "Kunne ikke opdatere bruger", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Flex direction="column" gap="4">
                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        Ny email (valgfrit)
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
                    {cancelButton || (
                        <Button type="button" variant="soft" color="gray" onClick={onCancel} className="cursor-pointer">
                            Annuller
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                        {isSubmitting ? 'Gemmer...' : submitLabel}
                    </Button>
                </Flex>
            </Flex>
        </form>
    );
}