"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { love } from "@/config/love";
import LoveButton from "@/components/LoveButton";

const TARGET = 10; // catches to win
const DURATION = 20; // seconds
const POOL = 10; // max hearts on screen at once
const HEART_SIZE = 36; // px
const BASKET_W = 84; // px
const BASKET_H = 60; // px
const SPAWN_EVERY = 650; // ms
const HEART_CHARS = ["❤️", "💖", "💗", "💕"];

type Heart = { active: boolean; x: number; y: number; vy: number };
type Status = "ready" | "playing" | "done";

/**
 * Scene 5: hearts fall, she drags a basket along the bottom.
 * The game loop is one requestAnimationFrame that writes transforms straight to
 * a fixed pool of DOM nodes, so React only re-renders when the score/timer changes.
 */
export default function HeartGame({ onNext }: { onNext: () => void }) {
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);

  const areaRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const heartEls = useRef<(HTMLSpanElement | null)[]>([]);
  const hearts = useRef<Heart[]>(
    Array.from({ length: POOL }, () => ({ active: false, x: 0, y: 0, vy: 0 })),
  );
  const basketX = useRef(0); // centre of the basket, px
  const scoreRef = useRef(0);

  /** Move the basket so its centre follows the finger, clamped to the area. */
  const moveBasket = useCallback((clientX: number) => {
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const half = BASKET_W / 2;
    basketX.current = Math.min(rect.width - half, Math.max(half, clientX - rect.left));
    if (basketRef.current) {
      basketRef.current.style.transform = `translate3d(${basketX.current - half}px,0,0)`;
    }
  }, []);

  // Centre the basket on mount.
  useEffect(() => {
    const area = areaRef.current;
    if (area) moveBasket(area.getBoundingClientRect().left + area.clientWidth / 2);
  }, [moveBasket]);

  // Main game loop + countdown, only while playing.
  useEffect(() => {
    if (status !== "playing") return;
    const area = areaRef.current;
    if (!area) return;

    let raf = 0;
    let last = performance.now();
    let sinceSpawn = SPAWN_EVERY;
    const started = last;
    let ended = false;

    const tick = (now: number) => {
      if (ended) return;
      const dt = Math.min(0.05, (now - last) / 1000); // cap so a background tab doesn't teleport hearts
      last = now;
      const w = area.clientWidth;
      const h = area.clientHeight;
      const basketTop = h - BASKET_H - 24;

      // Spawn a new heart from the pool every so often.
      sinceSpawn += dt * 1000;
      if (sinceSpawn >= SPAWN_EVERY) {
        sinceSpawn = 0;
        const free = hearts.current.find((ht) => !ht.active);
        if (free) {
          free.active = true;
          free.x = Math.random() * (w - HEART_SIZE);
          free.y = -HEART_SIZE;
          free.vy = h * (0.28 + Math.random() * 0.2); // crosses the screen in ~2–3.5 s
        }
      }

      hearts.current.forEach((ht, i) => {
        const el = heartEls.current[i];
        if (!el) return;
        if (!ht.active) {
          el.style.opacity = "0";
          return;
        }
        ht.y += ht.vy * dt;

        const centreX = ht.x + HEART_SIZE / 2;
        const caught =
          ht.y + HEART_SIZE >= basketTop + 10 &&
          ht.y < basketTop + BASKET_H / 2 &&
          Math.abs(centreX - basketX.current) < BASKET_W / 2 + 6;

        if (caught && !ended) {
          ht.active = false;
          el.style.opacity = "0";
          scoreRef.current += 1;
          setScore(scoreRef.current);
          navigator.vibrate?.(12);
          // Little bounce on the basket.
          basketRef.current?.animate(
            [{ scale: "1" }, { scale: "1.2" }, { scale: "1" }],
            { duration: 220 },
          );
          if (scoreRef.current >= TARGET) {
            ended = true;
            setStatus("done");
          }
          return;
        }
        if (ht.y > h) {
          ht.active = false;
          el.style.opacity = "0";
          return;
        }
        el.style.opacity = "1";
        el.style.transform = `translate3d(${ht.x}px,${ht.y}px,0)`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const timer = window.setInterval(() => {
      const left = Math.max(0, DURATION - Math.floor((performance.now() - started) / 1000));
      setTimeLeft(left);
      if (left === 0) setStatus("done");
    }, 250);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
    };
  }, [status]);

  // Hide all hearts once the game ends.
  useEffect(() => {
    if (status !== "done") return;
    hearts.current.forEach((ht, i) => {
      ht.active = false;
      const el = heartEls.current[i];
      if (el) el.style.opacity = "0";
    });
  }, [status]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (status !== "playing") return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    moveBasket(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (status !== "playing") return;
    // Touch/pen: only while pressed. Mouse: follow freely.
    if (e.pointerType === "mouse" || e.buttons > 0) moveBasket(e.clientX);
  };

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(DURATION);
    setStatus("playing");
  };

  return (
    <section className="flex h-dvh flex-col px-safe pt-safe pb-safe">
      {/* HUD */}
      <div className="flex items-center justify-between pt-6 pb-2 text-plum-800">
        <p className="text-lg font-bold" aria-live="polite">
          ❤️ {score} / {TARGET}
        </p>
        {/* <h2 className="font-script text-[clamp(1.6rem,7vw,2.25rem)] font-bold">Catch my heart</h2> */}
        <p className="text-lg font-bold tabular-nums">⏱ {timeLeft}s</p>
      </div>

      {/* Game area: touch-action none so dragging never scrolls/zooms the page */}
      <div
        ref={areaRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative flex-1 touch-none overflow-hidden rounded-3xl bg-white/35 ring-1 ring-white/60 select-none"
      >
        {Array.from({ length: POOL }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              heartEls.current[i] = el;
            }}
            aria-hidden
            className="absolute top-0 left-0 leading-none opacity-0 will-change-transform"
            style={{ fontSize: HEART_SIZE - 6, width: HEART_SIZE, height: HEART_SIZE }}
          >
            {HEART_CHARS[i % HEART_CHARS.length]}
          </span>
        ))}

        <div
          ref={basketRef}
          aria-hidden
          className="absolute bottom-6 left-0 flex items-end justify-center leading-none will-change-transform"
          style={{ width: BASKET_W, height: BASKET_H, fontSize: 52 }}
        >
          🧺
        </div>

        <AnimatePresence>
          {status === "ready" && (
            <Overlay key="ready">
              <p className="font-script text-4xl font-bold text-plum-800">Ready, {love.herName}?</p>
              <p className="text-base text-plum-700">
                Drag the basket with your finger and catch {TARGET} hearts in {DURATION} seconds.
              </p>
              <LoveButton glow onClick={start}>
                Start 💘
              </LoveButton>
            </Overlay>
          )}
          {status === "done" && (
            <Overlay key="done">
              <p className="font-script text-[clamp(1.9rem,8vw,2.6rem)] font-bold leading-snug text-plum-800">
                You caught my heart a long time ago anyway, {love.herName} ❤️
              </p>
              <p className="text-base text-plum-700">
                ({score} {score === 1 ? "heart" : "hearts"} caught. Not that I was counting.)
              </p>
              <LoveButton glow onClick={onNext}>
                Continue →
              </LoveButton>
            </Overlay>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-blush-50/85 p-6 text-center backdrop-blur-sm"
    >
      {children}
    </motion.div>
  );
}
