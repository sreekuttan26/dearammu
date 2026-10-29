"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Props = {
  lines: string[];
  /** ms per character */
  speed?: number;
  /** ms pause between lines */
  linePause?: number;
  onDone?: () => void;
  className?: string;
};

/**
 * Types out each line character by character (emoji-safe), with a blinking caret.
 * With reduced motion the full text appears immediately.
 */
export default function Typewriter({
  lines,
  speed = 55,
  linePause = 700,
  onDone,
  className,
}: Props) {
  const reduced = useReducedMotion();
  // Split into user-visible characters so emoji aren't cut in half.
  const chars = useMemo(() => lines.map((l) => Array.from(l)), [lines]);
  const [pos, setPos] = useState({ line: 0, char: 0 });

  const finished = !!reduced || pos.line >= chars.length;

  useEffect(() => {
    if (finished) return;
    const endOfLine = pos.char >= chars[pos.line].length;
    const t = window.setTimeout(
      () =>
        setPos(endOfLine ? { line: pos.line + 1, char: 0 } : { ...pos, char: pos.char + 1 }),
      endOfLine ? linePause : speed,
    );
    return () => window.clearTimeout(t);
  }, [pos, finished, chars, linePause, speed]);

  // Fire once when typing completes.
  useEffect(() => {
    if (finished) onDone?.();
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className} aria-live="polite">
      {chars.map((lc, i) => {
        if (i > pos.line && !finished) return null;
        const text = i < pos.line || finished ? lc.join("") : lc.slice(0, pos.char).join("");
        const active = !finished && i === pos.line;
        return (
          <p key={i} className="min-h-[1.5em]">
            {text}
            {active && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-current"
                style={{ animation: "blink 1s step-end infinite" }}
              />
            )}
          </p>
        );
      })}
    </div>
  );
}
