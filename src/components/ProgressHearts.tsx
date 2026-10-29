"use client";

import { motion } from "framer-motion";

/** Small heart dots at the top of the screen showing how far along the story is. */
export default function ProgressHearts({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center pt-safe"
      role="progressbar"
      aria-label="Story progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
    >
      <div className="flex gap-1.5 rounded-full bg-white/45 px-3 py-1 backdrop-blur-sm">
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden
            animate={{ scale: i === current ? 1.35 : 1, opacity: i <= current ? 1 : 0.35 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className={`text-[11px] leading-none ${i <= current ? "text-blush-600" : "text-plum-700"}`}
          >
            ♥
          </motion.span>
        ))}
      </div>
    </div>
  );
}
