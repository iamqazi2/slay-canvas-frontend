// "use client" not needed for pure TS file
import { Variants } from "framer-motion";

type Direction = 'up' | 'down' | 'left' | 'right';

interface FadeInProps {
  direction?: Direction;
  delay?: number;
}

export const fadeIn = ({ direction = 'up', delay = 0 }: FadeInProps): Variants => {
  return {
    hidden: {
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
      opacity: 0,
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        duration: 1.2,
        delay: delay,
        ease: [0.25, 0.25, 0.25, 0.75],
      },
    },
  };
};
