import { faCheckCircle, faClose, faExclamationCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as RadixToast from "@radix-ui/react-toast";
import { AnimatePresence, motion } from "framer-motion";

import {
  ElementRef,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useState,
} from "react";

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: "warning" | "error" | "success" | "info";
}

const ToastContext = createContext<{
  showToast: (
    title: string,
    description: string,
    type?: "warning" | "error" | "success" | "info"
  ) => void;
}>({
  showToast: () => {
    throw new Error(
      "You can't call showToast() outside of a <ToastProvider> – add it to your tree."
    );
  },
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  function showToast(
    title: string,
    description: string,
    type: "warning" | "error" | "success" | "info" = "info"
  ) {
    setMessages((toasts) => [
      ...toasts,
      {
        id: window.crypto.randomUUID(),
        type,
        title,
        description,
      },
    ]);
  }

  return (
    <RadixToast.Provider>
      <ToastContext.Provider value={{ showToast }}>
        {children}
      </ToastContext.Provider>
      <AnimatePresence mode="popLayout">
        {messages.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={() =>
              setMessages((toasts) => toasts.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </AnimatePresence>

      <RadixToast.Viewport className="fixed right-4 flex w-80 flex-col-reverse gap-3 top-4 sm:top-14" />
      </RadixToast.Provider>
  );
}

const Toast = forwardRef<
  ElementRef<typeof RadixToast.Root>,
  {
    onClose: () => void;
    type: "warning" | "error" | "success" | "info";
    title: string;
    description: string;
  }
>(function Toast({ onClose, type, title, description }, forwardedRef) {
  const width = 320;

  const typeStyles: Record<string, string> = {
    success: "border-l-green-700 dark:text-green-300 text-green-500",
    warning: "border-l-yellow-700 dark:text-yellow-300 text-yellow-500",
    error: "border-l-red-700 dark:text-red-300 text-red-500",
    info: "border-l-blue-700 dark:text-blue-300 text-blue-500",
  };

  const icons: Record<string, any> = {
    success: faCheckCircle,
    warning: faExclamationCircle,
    error: faTimesCircle,
    info: faCheckCircle,
  };

  return (
    <RadixToast.Root
      ref={forwardedRef}
      asChild
      forceMount
      onOpenChange={onClose}
      duration={2500}
      className="border dark:border-r-zinc-700 dark:border-b-zinc-700 dark:border-t-zinc-700">
      <motion.li
        layout
        initial={{ x: width + 16 }}
        animate={{ x: 0 }}
        exit={{
          opacity: 0,
          x: width + 16,
          transition: {
            opacity: { duration: 0.2 },
            x: { duration: 0.3 },
          },
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(event, info) => {
          if (info.offset.x > 250) {
            onClose();
          }
        }}
        transition={{
          type: "spring",
          mass: 1,
          damping: 30,
          stiffness: 200,
        }}
        className={`pt-4 pr-4 pb-4 pl-2 rounded-lg shadow-md backdrop-blur flex items-start gap-2 border-l-4 ${typeStyles[type]}`}>
            <span className="fa-stack fa-md">
            <FontAwesomeIcon icon={icons[type]} className="fa fa-circle-o fa-stack-2x opacity-10"/>
            <FontAwesomeIcon icon={icons[type]} className="fa fa-circle-o fa-stack-1x"/>
            </span>
        <div>
          <h4 className="font-bold text-mauve6 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <RadixToast.Close className="ml-auto transition-colors duration-200 text-gray-700 dark:text-gray-300 dark:hover:text-gray-300/30 hover:text-gray-300 active:text-white">
            <FontAwesomeIcon icon={faClose} />
        </RadixToast.Close>
      </motion.li>
    </RadixToast.Root>
  );
});
