"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type Props = HTMLMotionProps<"button"> & { glow?: boolean };

/** The main pink call-to-action button used across scenes (min 48px tall). */
export default function LoveButton({ glow, className = "", children, ...rest }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      className={`${glow ? "glow-halo" : ""} inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blush-600 to-blush-700 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-blush-500/30 ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
