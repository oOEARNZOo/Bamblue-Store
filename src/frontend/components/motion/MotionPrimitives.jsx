"use client";

import { motion, useReducedMotion } from "framer-motion";

export const smoothEase = [0.22, 1, 0.36, 1];

export const pageVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: smoothEase },
  },
};

export const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: smoothEase },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.05,
    },
  },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: smoothEase },
  },
};

export function PageMotion({ children, className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({ children, className = "", as = "div", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: revealVariants.hidden,
        visible: {
          ...revealVariants.visible,
          transition: { ...revealVariants.visible.transition, delay },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function Stagger({ children, className = "", as = "div" }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </Component>
  );
}

export function MotionCard({ children, className = "", as = "div", hover = true, ...props }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      variants={cardVariants}
      whileHover={hover && !reduceMotion ? { y: -4, scale: 1.015 } : undefined}
      whileTap={!reduceMotion ? { scale: 0.985 } : undefined}
      transition={{ duration: 0.24, ease: smoothEase }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

export function MotionButton({ children, className = "", as = "button", ...props }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.button;

  return (
    <Component
      whileHover={!reduceMotion ? { y: -1, scale: 1.015 } : undefined}
      whileTap={!reduceMotion ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.18, ease: smoothEase }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
