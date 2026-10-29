"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { love } from "@/config/love";
import FloatingHearts from "@/components/effects/FloatingHearts";
import HeartCursor from "@/components/effects/HeartCursor";
import { celebrate } from "@/components/effects/confetti";
import MusicToggle from "@/components/MusicToggle";
import ProgressHearts from "@/components/ProgressHearts";
import Envelope from "@/components/scenes/Envelope";
import Intro from "@/components/scenes/Intro";
import Timeline from "@/components/scenes/Timeline";
import ReasonsDeck from "@/components/scenes/ReasonsDeck";
import HeartGame from "@/components/scenes/HeartGame";
import Quiz from "@/components/scenes/Quiz";
import FinalMessage from "@/components/scenes/FinalMessage";
import BigQuestion from "@/components/scenes/BigQuestion";
import Celebration from "@/components/scenes/Celebration";

/** The story, in order. The page is a tiny state machine that walks through it. */
const SCENES = [
  "envelope",
  "intro",

  "game",
  
  "message",
  "question",
  "celebration",
] as const;
type Scene = (typeof SCENES)[number];

const STORAGE_KEY = "love-answer";
type SavedAnswer = { answer: "yes"; at: string };

function loadAnswer(): SavedAnswer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedAnswer) : null;
  } catch {
    return null; // private mode, blocked storage, bad JSON…
  }
}

function saveAnswer(value: SavedAnswer) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable: the celebration still works, it just won't persist */
  }
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [scene, setScene] = useState<Scene>("envelope");
  const [answeredAt, setAnsweredAt] = useState<string | null>(null);
  const [fresh, setFresh] = useState(false);
  const stopConfetti = useRef<(() => void) | null>(null);

  // Client-only start: decide where the story begins (a returning "yes" skips to the end).
  useEffect(() => {
    const saved = loadAnswer();
    if (saved?.answer === "yes") {
      setAnsweredAt(saved.at);
      setScene("celebration");
    }
    setReady(true);
    return () => stopConfetti.current?.();
  }, []);

  const goTo = useCallback((next: Scene) => {
    setScene(next);
    window.scrollTo({ top: 0 });
  }, []);

  const next = useCallback(() => {
    const i = SCENES.indexOf(scene);
    goTo(SCENES[Math.min(i + 1, SCENES.length - 1)]);
  }, [scene, goTo]);

  const sayYes = useCallback(() => {
    navigator.vibrate?.([120, 60, 120, 60, 300]);
    stopConfetti.current = celebrate(4500);
    const at = new Date().toISOString();
    saveAnswer({ answer: "yes", at });
    setAnsweredAt(at);
    setFresh(true);
    goTo("celebration");
  }, [goTo]);

  const renderScene = () => {
    switch (scene) {
      case "envelope":
        return <Envelope onNext={next} />;
      case "intro":
        return <Intro onNext={next} />;
      // case "timeline":
      //   return <Timeline onNext={next} />;
      // case "reasons":
      //   return <ReasonsDeck onNext={next} />;
      case "game":
        return <HeartGame onNext={next} />;
      // case "quiz":
      //   return <Quiz onNext={next} />;
      case "message":
        return <FinalMessage onNext={next} />;
      case "question":
        return <BigQuestion onYes={sayYes} />;
      case "celebration":
        return (
          <Celebration answeredAt={answeredAt} fresh={fresh} onReplay={() => goTo("envelope")} />
        );
    }
  };

  const calm = scene === "message" || scene === "question";

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-dvh overflow-x-hidden">
        <GradientBackground />

        {ready && (
          <>
            <FloatingHearts calm={calm} />
            <HeartCursor />
            <ProgressHearts current={SCENES.indexOf(scene)} total={SCENES.length} />

            {/* popLayout: the old scene fades out on top while the new one takes its place. */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={scene}
                className="relative z-10"
                // The intro continues the envelope's full-screen letter, so it appears instantly.
                initial={scene === "intro" ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {renderScene()}
              </motion.div>
            </AnimatePresence>

            <MusicToggle src={love.songUrl} />
          </>
        )}
      </main>
    </MotionConfig>
  );
}

/**
 * Blush → lavender → peach gradient that slowly drifts.
 * It is an oversized layer moved with transform (cheap), not an animated background-position.
 */
function GradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute -inset-1/2 animate-gradient-drift will-change-transform"
        style={{
          background:
            "linear-gradient(135deg, #ffe4ec 0%, #f1e9ff 30%, #ffeedd 55%, #fecdd9 80%, #e2d4fe 100%)",
        }}
      />
    </div>
  );
}
