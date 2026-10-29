"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  id: number;
  char: string;
  color: string;
  left: number; // vw
  size: number; // px
  duration: number; // s
  delay: number; // s (negative = already mid-flight on mount)
  sway: number; // px
  opacity: number;
};

const COLORS = ["#f43f75", "#fb7199", "#fda4bc", "#e11d5c", "#c9b2fc"];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => {
    const sparkle = id % 4 === 0;
    const duration = 12 + Math.random() * 12;
    return {
      id,
      char: sparkle ? "✦" : "♥",
      color: sparkle ? "#f6c453" : COLORS[id % COLORS.length],
      left: Math.random() * 100,
      size: sparkle ? 10 + Math.random() * 8 : 14 + Math.random() * 18,
      duration,
      delay: -Math.random() * duration,
      sway: 10 + Math.random() * 30,
      opacity: 0.35 + Math.random() * 0.45,
    };
  });
}

/**
 * Hearts and sparkles drifting upward behind every scene.
 * Pure CSS animations on transform/opacity. `calm` slows them down smoothly
 * (via the Web Animations API playbackRate) and fades them a little.
 */
export default function FloatingHearts({ calm = false }: { calm?: boolean }) {
  // ~22 particles on phones, a few more on bigger screens.
  const [particles] = useState(() =>
    makeParticles(window.innerWidth < 640 ? 22 : 32),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.getAnimations !== "function") return;
    for (const anim of el.getAnimations({ subtree: true })) {
      anim.updatePlaybackRate(calm ? 0.35 : 1);
    }
  }, [calm]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-[1500ms]"
      style={{ opacity: calm ? 0.5 : 1 }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-full block will-change-transform"
          style={
            {
              left: `${p.left}vw`,
              "--o": p.opacity,
              animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            } as React.CSSProperties
          }
        >
          <span
            className="block"
            style={
              {
                color: p.color,
                fontSize: p.size,
                "--sway": `${p.sway}px`,
                animation: `sway ${3 + (p.id % 3)}s ease-in-out ${p.delay}s infinite`,
              } as React.CSSProperties
            }
          >
            {p.char}
          </span>
        </span>
      ))}
    </div>
  );
}
