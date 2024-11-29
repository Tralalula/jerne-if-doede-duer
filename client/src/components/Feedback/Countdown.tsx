import { MotionValue, motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import clsx from "clsx";
import { Flex, Text } from "@radix-ui/themes";

export default function Countdown({value, type, fontSize = 50, padding = 15, className}: { value: number; type: string, fontSize?: number; padding?: number; className?: string;}) {
  const height = fontSize + padding;

  return (
    <Flex
      style={{ fontSize }}
      className={clsx(
        "space-x-1 overflow-hidden px-3 leading-none",
        className
      )}
    >
      <Digit place={10} value={value} height={height} />
      <Digit place={1} value={value} height={height} />
      <Flex align="center" justify="center">
        <Text weight="bold" className="mt-8" size="3">
          {type}
        </Text>
      </Flex>
    </Flex>
  );
}

function Digit({ place, value, height,}: { place: number; value: number; height: number;}) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch]">
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

function Number({ mv, number, height,}: { mv: MotionValue; number: number; height: number;}) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;

    let memo = offset * height;

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute font-bold inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}
