import { Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useState } from "react";

interface GameButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function GameButton({ onClick, children, className }: GameButtonProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected((prev) => !prev);
    if (onClick) onClick();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative inline-block"
    >
      <Button
        variant="surface"
        className={clsx(
          "cursor-pointer transition-colors duration-200 relative overflow-hidden",
          isSelected ? "dark:brightness-125" : "text-black dark:text-white",
          className
        )}
        onClick={handleClick}>
        <motion.div
          layout
          initial={isSelected ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={isSelected ? { scale: 1.2, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className={clsx(
              "absolute rounded-full z-0 border-2 w-10 h-10 md:w-14 md:h-14 pointer-events-none",
              "border-red10/80 shadow-[0_0_20px_rgba(200,0,0,0.75)] dark:shadow-[0_0_20px_rgba(200,30,30,0.25)] dark:border-red5"
            )}
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex items-center justify-center z-20"
        >
          {children}
        </motion.div>
      </Button>
    </motion.div>
  );
}
