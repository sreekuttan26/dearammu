"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { love } from "@/config/love";
import Typewriter from "@/components/effects/Typewriter";
import LoveButton from "@/components/LoveButton";

// Module-level so the array identity is stable for the Typewriter.
const LINES = [
  `Hey ${love.herName}... I made something just for you.`,
  "😊",
];

/** Scene 2: the opened letter, typed out like a typewriter. */
export default function Intro({ onNext }: { onNext: () => void }) {
  const [typed, setTyped] = useState(false);

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-cream/95 px-safe pt-safe pb-safe">
      <div className="w-full max-w-md">
        <Typewriter
          lines={LINES}
          onDone={() => setTyped(true)}
          className="space-y-4 text-center font-script text-[clamp(1.9rem,8.5vw,2.75rem)] font-bold leading-snug text-plum-800"
        />

        <div className="mt-12 flex h-16 justify-center">
          <AnimatePresence>
            {typed && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <LoveButton glow onClick={onNext} autoFocus>
                  Let&apos;s go →
                </LoveButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
