"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { love } from "@/config/love";

type Phase = "sealed" | "opening" | "expanding";

/**
 * Scene 1: a sealed envelope. On tap the wax seal pops, the flap swings open in 3D,
 * the letter slides out and then grows to fill the screen.
 */
export default function Envelope({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<Phase>("sealed");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (phase !== "sealed") return;
    navigator.vibrate?.(15);
    setPhase("opening");
    timers.current.push(
      window.setTimeout(() => setPhase("expanding"), 1700),
      window.setTimeout(onNext, 1700 + 750), // after the letter has filled the screen
    );
  };

  const opened = phase !== "sealed";

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center gap-10 px-safe pt-safe pb-safe">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={opened ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
        transition={{ duration: opened ? 0.4 : 0.8 }}
        className="text-center font-script text-[clamp(2.4rem,11vw,4rem)] font-bold text-plum-800"
      >
        For {love.herName} 💌 from Sree
      </motion.h1>

      <motion.button
        type="button"
        onClick={open}
        aria-label={`Open the envelope for ${love.herName}`}
        disabled={opened}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={opened ? { opacity: 1, scale: 1, y: 30 } : { opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={
          opened
            ? { duration: 0.6 }
            : { y: { duration: 3, repeat: Infinity, ease: "easeInOut" }, duration: 0.6 }
        }
        whileTap={opened ? undefined : { scale: 0.96 }}
        className="relative aspect-[10/7] w-[min(82vw,340px)]"
        style={{ perspective: 1000 }}
      >
        {/* Back of the envelope */}
        <div className="absolute inset-0 rounded-xl bg-blush-400 shadow-2xl shadow-plum-800/30" />

        {/* The letter inside */}
        <motion.div
          className="absolute inset-x-[7%] top-[6%] z-10 h-[88%] rounded-lg bg-cream p-4 text-left shadow-md"
          animate={opened ? { y: "-58%" } : { y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-script text-2xl font-bold text-blush-700">Dear {love.herName},</p>
          <div className="mt-3 space-y-2" aria-hidden>
            <div className="h-1.5 w-11/12 rounded bg-blush-100" />
            <div className="h-1.5 w-4/5 rounded bg-blush-100" />
            <div className="h-1.5 w-2/3 rounded bg-blush-100" />
          </div>
        </motion.div>

        {/* Front pocket with a V cut-out so the letter peeks through */}
        <div
          className="absolute inset-0 z-20 rounded-xl bg-gradient-to-b from-blush-200 to-blush-300"
          style={{ clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)" }}
        />

        {/* Top flap: rotates open in 3D, then drops behind the letter */}
        <motion.div
          className="absolute inset-x-0 top-0 z-30 h-[56%] origin-top rounded-t-xl bg-gradient-to-b from-blush-300 to-blush-400"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          animate={opened ? { rotateX: 180, zIndex: 5 } : { rotateX: 0, zIndex: 30 }}
          transition={{
            rotateX: { delay: 0.3, duration: 0.6, ease: "easeInOut" },
            zIndex: { delay: 0.6, duration: 0 },
          }}
        />

        {/* Wax seal */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[56%] z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blush-600 to-blush-800 text-2xl text-blush-100 shadow-lg ring-4 ring-blush-700/40"
          style={{ x: "-50%", y: "-50%" }}
          animate={opened ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          ♥
        </motion.div>
      </motion.button>

      <motion.p
        animate={{ opacity: opened ? 0 : 1 }}
        className="h-6 text-base font-medium text-plum-700"
      >
        <span className="inline-block animate-soft-pulse">Tap to open</span>
      </motion.p>

      {/* The letter grows to fill the screen, then we move on */}
      {phase === "expanding" && (
        <motion.div
          className="fixed inset-0 z-50 bg-cream"
          initial={{ opacity: 0, scale: 0.35, y: -60, borderRadius: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0, borderRadius: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </section>
  );
}
