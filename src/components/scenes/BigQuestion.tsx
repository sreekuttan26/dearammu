"use client";

import { Fragment, useRef } from "react";
import { motion } from "framer-motion";
import { love } from "@/config/love";
import DodgingNoButton from "@/components/DodgingNoButton";

const QUESTION = `${love.herName}, shall we start seeing each other?`;
const LETTER_DELAY = 0.045; // seconds per letter
const TOTAL_CHARS = Array.from(QUESTION).length;

// Each word with its letters and the delay at which each letter appears.
const WORDS = (() => {
  let n = 0;
  return QUESTION.split(" ").map((word) => {
    const letters = Array.from(word).map((ch) => ({ ch, delay: 0.3 + n++ * LETTER_DELAY }));
    n++; // the space between words
    return letters;
  });
})();

/** Scene 8: the question, written letter by letter, with a Yes and a very shy No. */
export default function BigQuestion({ onYes }: { onYes: () => void }) {
  const yesRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-safe pt-safe pb-safe text-center">
      <h1
        aria-label={QUESTION}
        className="max-w-xl font-script text-[clamp(2.5rem,11vw,4.5rem)] font-bold leading-tight text-plum-800"
      >
        {/* Words stay unbroken; each letter springs in after the previous one. */}
        {WORDS.map((letters, w) => (
          <Fragment key={w}>
            <span aria-hidden className="inline-block whitespace-nowrap">
              {letters.map(({ ch, delay }, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 24, rotate: -10 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay, type: "spring", stiffness: 200, damping: 14 }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>{" "}
          </Fragment>
        ))}
      </h1>

      {/* Fade only (no movement) so the No button's starting spot is measured correctly. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + TOTAL_CHARS * LETTER_DELAY, duration: 0.8 }}
        className="mt-14 flex flex-wrap items-center justify-center gap-8"
      >
        <motion.button
          ref={yesRef}
          type="button"
          onClick={onYes}
          whileTap={{ scale: 0.92 }}
          className="glow-halo min-h-16 rounded-full bg-gradient-to-r from-blush-600 to-blush-700 px-12 text-2xl font-bold text-white shadow-xl shadow-blush-600/40"
        >
          <span className="inline-block animate-[heartbeat_1.6s_ease-in-out_infinite]">
            Yes 💖
          </span>
        </motion.button>

        <DodgingNoButton avoidRef={yesRef} />
      </motion.div>
    </section>
  );
}
