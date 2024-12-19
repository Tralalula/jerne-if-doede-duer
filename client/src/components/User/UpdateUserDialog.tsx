import React from 'react';
import { Dialog, Button } from '@radix-ui/themes';
import UpdateUserForm from "./UpdateUserForm";
import { UserDetailsResponse } from '../import';

interface UpdateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserDetailsResponse | null;
}

export default function UpdateUserDialog({ open, onOpenChange, user }: UpdateUserDialogProps) {
    if (!user) return null;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content>
                <Dialog.Title>Rediger Bruger</Dialog.Title>
                <Dialog.Description>{/* Tom for at undgå aria warning */}</Dialog.Description>

                <div className="mt-4">
                    <UpdateUserForm
                        user={user}
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