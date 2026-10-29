"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Floating music button (bottom-right, above the safe area).
 * Music is OFF by default and only starts after a tap, as mobile browsers require.
 * Hides itself if the song file is missing.
 */
export default function MusicToggle({ src }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState(false);

  // Stop the music if the component ever unmounts.
  useEffect(() => () => audioRef.current?.pause(), []);

  if (!src || broken) return null;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      audio.volume = 0.6;
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="metadata" onError={() => setBroken(true)} />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        aria-pressed={playing}
        className="fixed z-50 flex size-12 items-center justify-center rounded-full bg-white/80 shadow-lg shadow-blush-500/20 backdrop-blur-sm active:scale-95"
        style={{
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        {/* Animated equalizer bars; they sit still when paused. */}
        <span aria-hidden className="flex h-5 items-end gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="block h-full w-[3px] origin-bottom rounded-full bg-blush-600"
              style={{
                transform: playing ? undefined : "scaleY(0.3)",
                animation: playing ? `eq-bar ${0.6 + i * 0.15}s ease-in-out ${i * 0.1}s infinite` : "none",
              }}
            />
          ))}
        </span>
      </button>
    </>
  );
}
