import React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, Button } from '@radix-ui/themes';
import { balanceAtom, TransactionDetailsResponse, transactionsAtom, useToast } from '../import';
import { useForm, SubmitHandler } from "react-hook-form";
import AddCreditsForm from "./AddCreditsForm";

interface AddCreditsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AddCreditsDialog({ open, onOpenChange }: AddCreditsDialogProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content>
                <Dialog.Title>Tilføj Credits</Dialog.Title>
                <Dialog.Description>{/* Er tom for at undgå aria warning */}</Dialog.Description>

                <div className="mt-4">
                    <AddCreditsForm onSuccess={() => onOpenChange(false)} 
                        cancelButton={
                            <Dialog.Close>
                                <Button type="button" variant="soft" color="gray">
                                    Annuller
                                </Button>
                            </Dialog.Close>
                        }
                    />
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
}