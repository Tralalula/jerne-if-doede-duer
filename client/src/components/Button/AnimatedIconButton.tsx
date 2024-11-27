import { Tooltip, IconButton } from "@radix-ui/themes";
import { motion } from "framer-motion";

import './Buttons.css';

interface AnimatedIconButtonProps {
  tooltipContent: string;
  onClick: () => void;
  children: React.ReactNode;
}

export default function AnimatedIconButton({
  tooltipContent,
  onClick,
  children,
}: AnimatedIconButtonProps) {
  return (
    <Tooltip content={tooltipContent}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="inline-block">
        <IconButton
          variant="outline"
          className="animated-icon-button cursor-pointer shadow-none p-2 bg-transparent transition-colors duration-100"
          onClick={onClick}>
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              rotate: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex items-center justify-center">
            {children}
          </motion.div>
        </IconButton>
      </motion.div>
    </Tooltip>
  );
}
