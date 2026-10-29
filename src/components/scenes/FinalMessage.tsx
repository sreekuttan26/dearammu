"use client";

import { motion } from "framer-motion";
import { love } from "@/config/love";
import LoveButton from "@/components/LoveButton";

const LINE_GAP = 1.6; // seconds between lines

/**
 * Scene 7: the lights dim, the hearts slow down (handled by the page),
 * and the message fades in one line at a time.
 */
export default function FinalMessage({ onNext }: { onNext: () => void }) {
  const lines = love.finalMessage;
  const afterLines = 0.8 + lines.length * LINE_GAP;

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center px-safe pt-safe pb-safe text-center">
      {/* Dimmer over the pastel background */}
      <motion.div
        aria-hidden
        className="fixed inset-0 -z-10 bg-plum-900/75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      <div className="max-w-md space-y-4">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * LINE_GAP, duration: 1.2 }}
            className="text-[clamp(1.1rem,4.8vw,1.35rem)] leading-relaxed text-white"
          >
            {line}
          </motion.p>
        ))}
      </div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: afterLines, type: "spring", stiffness: 120, damping: 10 }}
        className="mt-10 text-7xl"
      >
        <span className="inline-block animate-heartbeat">❤️</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: afterLines + 1, duration: 1.2 }}
        className="mt-6 font-script text-[clamp(1.9rem,8vw,2.6rem)] font-bold text-blush-200"
      >
        {love.herName}, I have one question for you...
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: afterLines + 2.2, duration: 0.8 }}
        className="mt-8"
      >
        <LoveButton glow onClick={onNext}>
          Ask me 💗
        </LoveButton>
      </motion.div>
    </section>
  );
}
