import { Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import clsx from "clsx";

interface GameButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
}

export default function GameButton({onClick, children, className, isSelected = false, selectable = true, disabled = false,}: GameButtonProps) {
  const handleClick = () => {
    if (!disabled && selectable && onClick) onClick();
  };

  return (
    <motion.div
      whileHover={!disabled && !isSelected ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className="relative inline-block"
    >
      <Button
        variant="surface"
        className={clsx(
          "cursor-pointer transition-all duration-200 relative overflow-hidden",
          isSelected
            ? "dark:brightness-125 scale-95"
            : "text-black dark:text-white shadow-none",
          disabled ? "dark:opacity-50" : "",
          className
        )}
        onClick={handleClick}
        disabled={disabled}
      >
        <motion.div
          layout
          initial={isSelected ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={isSelected ? { scale: 1.2, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {selectable && isSelected && (
            <div
              className={clsx(
                "absolute rounded-full z-0 border-2 w-10 h-10 md:w-14 md:h-14 pointer-events-none",
                "border-red10/50 shadow-[0_0_20px_rgba(200,0,0,0.5)] dark:shadow-[0_0_20px_rgba(200,30,30,0.25)] dark:border-red5/60"
              )}
            />
          )}
        </motion.div>
        <motion.div
          whileHover={!disabled ? { scale: 1.1 } : {}}
          whileTap={!disabled ? { scale: 0.9 } : {}}
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
