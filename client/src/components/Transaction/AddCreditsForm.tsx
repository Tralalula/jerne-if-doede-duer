import React from 'react';
import { Flex, Text, TextField, Button } from '@radix-ui/themes';
import { useAtom } from 'jotai';
import { balanceAtom, TransactionDetailsResponse, transactionsAtom, useToast } from '../import';
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { api } from '../import';

interface AddCreditsFormProps {
    onSuccess?: () => void;
    submitLabel?: string;
    cancelButton?: React.ReactNode;
}

interface AddCreditsFormData {
    credits: string;
    mobilePayId: string;
}

const schema = yup.object({
    credits: yup
        .string()
        .required("Beløb er påkrævet")
        .test("positive", "Beløb skal være større end 0", value =>
            !value || parseInt(value) > 0
        )
        .test("max", "Beløb kan ikke overstige 10000", value =>
            !value || parseInt(value) <= 10000
        ),
    mobilePayId: yup
        .string()
        .required("MobilePay ID er påkrævet")
        .matches(/^[A-Za-z0-9]+$/, "MobilePay ID må kun indeholde tal og bogstaver")
        .min(6, "MobilePay ID skal være mindst 6 cifre")
        .max(12, "MobilePay ID kan ikke overstige 12 cifre")
}).required();

export default function AddCreditsForm({ onSuccess, submitLabel = 'Tilføj', cancelButton }: AddCreditsFormProps) {
    const [, setBalance] = useAtom(balanceAtom);
    const [, setTransactions] = useAtom(transactionsAtom);
    const { showToast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<AddCreditsFormData>({
        resolver: yupResolver(schema),
        mode: 'onSubmit',
        defaultValues: {
            credits: '',
            mobilePayId: ''
        }
    });

    const onSubmit: SubmitHandler<AddCreditsFormData> = async (data) => {
        try {
            const transactionResponse = await api.transaction.createTransaction({
                credits: parseInt(data.credits),
                mobilePayTransactionNumber: data.mobilePayId,
            });

            showToast("Succes", "Transaktion indsendt til godkendelse", "success");

            const newTransaction: TransactionDetailsResponse = {
                ...transactionResponse.data,
                reviewedByUserId: null,
                reviewedAt: null
            };
            setTransactions(prev => [newTransaction, ...prev]);

            const balanceResponse = await api.transaction.getBalance();
            setBalance(balanceResponse.data);

            reset();
            onSuccess?.();
        } catch (error) {
            showToast("Fejl", "Kunne ikke oprette transaktion", "error");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Flex direction="column" gap="4">
                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        Antal Credits
                    </Text>
                    <TextField.Root type="number"
                                    onKeyDown={(e) => {
                                        if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' || e.key === '.' || e.key === ',') {
                                            e.preventDefault();
                                        }
                                    }}
                                    variant="soft" 
                                    color="gray" 
                                    placeholder="Indtast beløb" 
                                    className={`border dark:border-gray5 ${errors.credits ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                                    {...register("credits")} 
                                    disabled={isSubmitting}>
                        <TextField.Slot side="right">
                            <Text size="2" color="gray">kr.</Text>
                        </TextField.Slot>
                    </TextField.Root>
                    <Flex mt="1" align="center" className={`error-wrapper ${errors.credits ? 'error-visible' : ''}`}>
                        {errors.credits && (
                            <Text color="red" size="1" className="flex gap-1 items-center">
                                <FontAwesomeIcon icon={faWarning} />
                                {errors.credits.message}
                            </Text>
                        )}
                    </Flex>
                </Flex>

                <Flex direction="column">
                    <Text as="label" size="2" weight="medium" mb="2">
                        MobilePay ID
                    </Text>
                    <TextField.Root variant="soft" 
                                    color="gray" 
                                    placeholder="Indtast MobilePay ID" 
                                    className={`border dark:border-gray5 ${errors.mobilePayId ? "border-red9 outline-red9 dark:border-red9 dark:outline-red9" : ""}`}
                                    {...register("mobilePayId")} 
                                    disabled={isSubmitting} />
                    <Flex mt="1" align="center" className={`error-wrapper ${errors.mobilePayId ? 'error-visible' : ''}`}>
                        {errors.mobilePayId && (
                            <Text color="red" size="1" className="flex gap-1 items-center">
                                <FontAwesomeIcon icon={faWarning} />
                                {errors.mobilePayId.message}
                            </Text>
                        )}
                    </Flex>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    {cancelButton}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Behandler...' : submitLabel}
                    </Button>
                </Flex>
            </Flex>
        </form>
    );
}