"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { love, type QuizQuestion } from "@/config/love";
import { heartBurst } from "@/components/effects/confetti";
import LoveButton from "@/components/LoveButton";

/**
 * Scene 6: "How well do you know us?" One question at a time.
 * Right = hearts burst from the button; wrong = gentle shake + cute reaction.
 * Every answer lets her continue, so nothing ever blocks progress.
 */
export default function Quiz({ onNext }: { onNext: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const finished = qIndex >= love.quiz.length;

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-safe pt-safe pb-safe">
      <h2 className="mt-8 text-center font-script text-[clamp(2rem,9vw,3.25rem)] font-bold leading-tight text-plum-800">
        How well do you know us?
      </h2>

      <div className="mt-6 w-full max-w-md">
        <AnimatePresence mode="wait">
          {finished ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 rounded-3xl bg-white/75 p-6 text-center shadow-xl"
            >
              <p className="text-6xl" aria-hidden>
                🏆
              </p>
              <p className="text-xl font-semibold text-plum-800">
                You got {score} / {love.quiz.length}!
              </p>
              <p className="text-base text-plum-700">
                Honestly, any score is perfect when it&apos;s you, {love.herName}.
              </p>
              <LoveButton glow onClick={onNext}>
                One last thing →
              </LoveButton>
            </motion.div>
          ) : (
            <QuestionCard
              key={qIndex}
              q={love.quiz[qIndex]}
              number={qIndex + 1}
              total={love.quiz.length}
              onAnswered={(right) => right && setScore((s) => s + 1)}
              onNext={() => setQIndex((i) => i + 1)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

type QuestionProps = {
  q: QuizQuestion;
  number: number;
  total: number;
  onAnswered: (right: boolean) => void;
  onNext: () => void;
};

function QuestionCard({ q, number, total, onAnswered, onNext }: QuestionProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const right = picked === q.correctIndex;

  const choose = (i: number, el: HTMLElement) => {
    if (picked !== null) return;
    setPicked(i);
    const isRight = i === q.correctIndex;
    onAnswered(isRight);
    if (isRight) {
      heartBurst(el);
      navigator.vibrate?.(20);
    } else {
      navigator.vibrate?.([30, 40, 30]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl bg-white/75 p-5 shadow-xl backdrop-blur-sm"
    >
      <p className="text-sm font-semibold tracking-wider text-blush-700 uppercase">
        Question {number} of {total}
      </p>
      <h3 className="mt-2 text-[clamp(1.25rem,5.5vw,1.6rem)] font-bold leading-snug text-plum-900">
        {q.question}
      </h3>

      <div className="mt-5 flex flex-col gap-3">
        {q.options.map((opt, i) => (
          <OptionButton
            key={i}
            label={opt}
            state={
              picked === null
                ? "idle"
                : i === q.correctIndex
                  ? "right"
                  : i === picked
                    ? "wrong"
                    : "dim"
            }
            onChoose={(el) => choose(i, el)}
          />
        ))}
      </div>

      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex flex-col items-center gap-4 text-center"
          >
            <p className="text-lg font-medium text-plum-800" aria-live="polite">
              {right ? q.reactionIfRight : q.reactionIfWrong}
            </p>
            <LoveButton onClick={onNext} autoFocus>
              {number < total ? "Next question →" : "See my score →"}
            </LoveButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type OptionState = "idle" | "right" | "wrong" | "dim";

const OPTION_STYLES: Record<OptionState, string> = {
  idle: "bg-white text-plum-900 ring-2 ring-blush-200 active:bg-blush-50",
  right: "bg-emerald-600 text-white ring-2 ring-emerald-600",
  wrong: "bg-blush-100 text-plum-900 ring-2 ring-blush-400",
  dim: "bg-white/60 text-plum-700 ring-2 ring-transparent",
};

function OptionButton({
  label,
  state,
  onChoose,
}: {
  label: string;
  state: OptionState;
  onChoose: (el: HTMLElement) => void;
}) {
  const controls = useAnimationControls();

  // Gentle shake when this option turns out to be a wrong pick.
  useEffect(() => {
    if (state === "wrong") {
      controls.start({ x: [0, -10, 10, -7, 7, -3, 0], transition: { duration: 0.5 } });
    }
  }, [state, controls]);

  return (
    <motion.button
      type="button"
      animate={controls}
      whileTap={state === "idle" ? { scale: 0.97 } : undefined}
      disabled={state !== "idle"}
      onClick={(e) => onChoose(e.currentTarget)}
      className={`min-h-14 w-full rounded-2xl px-5 py-3 text-left text-base font-semibold transition-colors disabled:cursor-default ${OPTION_STYLES[state]}`}
    >
      {state === "right" && <span aria-hidden>💚 </span>}
      {state === "wrong" && <span aria-hidden>🙈 </span>}
      {label}
    </motion.button>
  );
}
