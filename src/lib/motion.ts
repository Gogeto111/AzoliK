// Apple-like spring physics — snappy but not harsh, feels weighty & premium
// Framer Motion Spring uses 'stiffness', 'damping', 'mass' (no 'type' key needed when spring is inferred, but we export via transitions)
import type { Transition } from "framer-motion";

export const softSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 1,
};

export const snappySpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 32,
  mass: 0.9,
};

export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 18,
  mass: 0.7,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 1.2,
};

// Shared transitions
export const fadeInUp = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(4px)" },
} as const;

export const durations = {
  fast: 0.18,
  base: 0.28,
  slow: 0.5,
  cinematic: 0.8,
};

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  apple: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
