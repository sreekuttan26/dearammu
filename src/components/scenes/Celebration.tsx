"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { love } from "@/config/love";
import { celebrate } from "@/components/effects/confetti";
import LoveButton from "@/components/LoveButton";

type Props = {
  /** ISO timestamp of when she said yes */
  answeredAt: string | null;
  /** True right after tapping Yes (the big confetti already fired); false on a revisit. */
  fresh: boolean;
  onReplay: () => void;
};

/** Scene 9: she said YES. */
export default function Celebration({ answeredAt, fresh, onReplay }: Props) {
  // On a revisit, greet her with a smaller burst of confetti.
  useEffect(() => {
    if (fresh) return;
    const stop = celebrate(1500);
    return stop;
  }, [fresh]);

  const when = answeredAt
    ? new Date(answeredAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })
    : null;
  const phone = love.myPhone?.replace(/\s+/g, "");

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-safe pt-safe pb-safe text-center">
      <motion.div
        aria-hidden
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 10 }}
        className="text-[clamp(6rem,30vw,10rem)] leading-none"
      >
        <span className="inline-block animate-heartbeat">💖</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 font-script text-[clamp(2.5rem,11vw,4.5rem)] font-bold leading-tight text-plum-800"
      >
        Yayyy! 🥰
        <br />
        {love.herName} said YES!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-5 max-w-sm text-lg leading-relaxed text-plum-800"
      >
        You just made {love.myName} the happiest person alive. Now go text or call{" "}
        {love.myName} right away. Someone is nervously staring at their phone 📱💕
      </motion.p>

      {when && (
        <p className="mt-3 text-sm text-plum-700">Officially said yes on {when}</p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-8 flex w-full max-w-xs flex-col gap-3"
      >
        {phone && (
          <div className="flex gap-3">
            <a
              href={`sms:${phone}`}
              className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-blush-700 px-4 text-base font-semibold text-white shadow-lg"
            >
              Text me 💬
            </a>
            <a
              href={`tel:${phone}`}
              className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-plum-700 px-4 text-base font-semibold text-white shadow-lg"
            >
              Call me 📞
            </a>
          </div>
        )}
        <LoveButton onClick={() => celebrate(2500)}>Celebrate again 🎉</LoveButton>
        <button
          type="button"
          onClick={onReplay}
          className="min-h-12 rounded-full px-4 text-base font-semibold text-plum-700 underline-offset-4 hover:underline"
        >
          Relive our story ↺
        </button>
      </motion.div>
    </section>
  );
}
