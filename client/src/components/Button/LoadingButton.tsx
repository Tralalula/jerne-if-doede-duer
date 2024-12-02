import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Skeleton, Spinner } from "@radix-ui/themes";

interface LoadingButtonProps {
    isLoading: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    skeleton?: boolean;
    children: React.ReactNode;
}

export default function LoadingButton({isLoading, onClick, type = "button", disabled = false, skeleton = false, children,}: LoadingButtonProps) {
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setHasInteracted(true);
        if (onClick) onClick(e);
    };
    return (
        <Skeleton loading={skeleton}>
            <Button
                className="w-full cursor-pointer flex justify-center items-center relative overflow-hidden 
                        text-white transition-colors duration-300 
                        disabled:text-opacity-50 disabled:cursor-not-allowed"
                type={type}
                onClick={handleClick}
                disabled={disabled || isLoading}>
                <AnimatePresence>
                    {!isLoading && (
                        <motion.span
                            key="buttonText"
                            initial={hasInteracted ? { y: 40, opacity: 0 } : false}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 750,
                                damping: 30,
                            }}
                            className="absolute"
                        >
                            {children}
                        </motion.span>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            key="spinner"
                            initial={hasInteracted ? { y: -40, opacity: 0 } : false}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -40, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 750,
                                damping: 30,
                            }}
                            className="absolute"
                        >
                            <Spinner size="2" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </Skeleton>
        );
}
