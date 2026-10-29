"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { love } from "@/config/love";
import LoveButton from "@/components/LoveButton";

const SWIPE_DISTANCE = 100; // px
const SWIPE_VELOCITY = 500; // px/s

/** Scene 4: a Tinder-style deck. Tap to flip a card, swipe it away for the next one. */
export default function ReasonsDeck({ onNext }: { onNext: () => void }) {
  const reasons = love.reasons;
  const [index, setIndex] = useState(0);
  // Bumped by the "Next" button to fling the top card programmatically.
  const [flingSignal, setFlingSignal] = useState(0);
  const done = index >= reasons.length;

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center overflow-hidden px-safe pt-safe pb-safe">
      <h2 className="text-center font-script text-[clamp(2rem,9vw,3.25rem)] font-bold leading-tight text-plum-800">
        Reasons I like you, {love.herName}
      </h2>

      <p className="mt-2 text-base font-semibold text-blush-700" aria-live="polite">
        {done ? `${reasons.length} / ${reasons.length}` : `${index + 1} / ${reasons.length}`}
      </p>

      <div className="relative mt-6 h-[min(58dvh,420px)] w-[min(80vw,320px)]">
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-full flex-col items-center justify-center gap-8 text-center"
          >
            <p className="font-script text-[clamp(2rem,9vw,2.75rem)] font-bold text-plum-800">
              ...and a million more, {love.herName}.
            </p>
            <LoveButton glow onClick={onNext}>
              Keep going →
            </LoveButton>
          </motion.div>
        ) : (
          // Render the top 3 cards; only the top one is interactive.
          reasons
            .slice(index, index + 3)
            .map((reason, i) => (
              <ReasonCard
                key={index + i}
                number={index + i + 1}
                reason={reason}
                depth={i}
                flingSignal={flingSignal}
                onGone={() => setIndex((n) => n + 1)}
              />
            ))
            .reverse()
        )}
      </div>

      {!done && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-plum-700">Tap to flip · swipe for the next</p>
          <button
            type="button"
            onClick={() => setFlingSignal((n) => n + 1)}
            className="min-h-12 rounded-full bg-white/70 px-6 text-base font-semibold text-plum-800 shadow active:scale-95"
          >
            Next reason ›
          </button>
        </div>
      )}
    </section>
  );
}

type CardProps = {
  number: number;
  reason: string;
  depth: number; // 0 = top card
  flingSignal: number;
  onGone: () => void;
};

function ReasonCard({ number, reason, depth, flingSignal, onGone }: CardProps) {
  const isTop = depth === 0;
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-18, 18]);

  const fling = (dir: 1 | -1) => {
    if (leaving) return;
    setLeaving(true);
    navigator.vibrate?.(10);
    animate(x, dir * (window.innerWidth + 200), { duration: 0.35, ease: "easeIn" }).then(onGone);
  };

  // The "Next reason" button flings the top card to the right. Cards remember the
  // last signal they saw, so a card promoted to the top doesn't fling itself.
  const seenSignal = useRef(flingSignal);
  useEffect(() => {
    if (flingSignal === seenSignal.current) return;
    seenSignal.current = flingSignal;
    if (isTop) fling(1);
  }, [flingSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
      fling(info.offset.x > 0 ? 1 : -1);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 touch-none select-none"
      style={{ x, rotate, zIndex: 10 - depth }}
      initial={false}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      drag={isTop && !leaving ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      onTap={() => isTop && !leaving && setFlipped((f) => !f)}
    >
      <div className="h-full w-full" style={{ perspective: 1200 }}>
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-blush-500 to-blush-700 p-6 text-white shadow-2xl shadow-plum-800/30"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <span aria-hidden className="text-6xl">💗</span>
            <p className="font-script text-4xl font-bold">Reason #{number}</p>
            <p className="text-base text-white/90">tap to reveal</p>
          </div>

          {/* Back (the reason) */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-3xl bg-cream p-7 text-center shadow-2xl shadow-plum-800/30 ring-4 ring-blush-200"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <p className="font-script text-[clamp(1.6rem,7vw,2.1rem)] font-bold leading-snug text-plum-800">
              {reason}
            </p>
          </div>
        </motion.div>
      </div>
      {/* Screen readers get the reason directly */}
      {isTop && <span className="sr-only">{reason}</span>}
    </motion.div>
  );
}
