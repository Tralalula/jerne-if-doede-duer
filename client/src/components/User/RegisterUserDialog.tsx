import React from 'react';
import { Dialog, Button } from '@radix-ui/themes';
import RegisterUserForm from "./RegisterUserForm";

interface RegisterUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RegisterUserDialog({ open, onOpenChange }: RegisterUserDialogProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content>
                <Dialog.Title>Opret Bruger</Dialog.Title>
                <Dialog.Description>{/* Tom for at undgå aria warning */}</Dialog.Description>

                <div className="mt-4">
                    <RegisterUserForm
                        onSuccess={() => onOpenChange(false)}
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
