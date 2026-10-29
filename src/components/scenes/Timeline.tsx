"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import { love, type Memory } from "@/config/love";
import LoveButton from "@/components/LoveButton";

// Fixed "random" tilts so cards look hand-placed but render the same every time.
const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5, -2, 2];

/** Scene 3: our story as polaroids on a timeline that draws itself as she scrolls. */
export default function Timeline({ onNext }: { onNext: () => void }) {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 60%"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section className="min-h-dvh px-safe pt-safe pb-safe">
      <header className="mx-auto max-w-2xl pt-10 pb-8 text-center">
        <h2 className="font-script text-[clamp(2.4rem,11vw,4rem)] font-bold text-plum-800">
          Our little story
        </h2>
        <p className="mt-2 text-base text-plum-700">Scroll down, {love.herName} ↓</p>
      </header>

      <ol ref={listRef} className="relative mx-auto max-w-3xl pb-10">
        {/* Faint track + the line that draws itself (scaleY only = cheap) */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-5 w-1 -translate-x-1/2 rounded-full bg-blush-200 md:left-1/2"
        />
        <motion.div
          aria-hidden
          className="absolute top-0 bottom-0 left-5 w-1 origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-blush-500 to-lavender-400 md:left-1/2"
          style={{ scaleY: lineScale }}
        />

        {love.memories.map((m, i) => (
          <TimelineItem key={i} memory={m} index={i} />
        ))}
      </ol>

      <div className="flex justify-center pb-12">
        <LoveButton onClick={onNext}>There&apos;s more →</LoveButton>
      </div>
    </section>
  );
}

function TimelineItem({ memory, index }: { memory: Memory; index: number }) {
  const tilt = TILTS[index % TILTS.length];
  const right = index % 2 === 1; // only used from md: up

  return (
    <li className="relative mb-12 pl-12 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
      {/* Heart marker on the line */}
      <span
        aria-hidden
        className="absolute top-6 left-5 z-10 flex size-8 -translate-x-1/2 items-center justify-center rounded-full bg-white text-blush-600 shadow md:left-1/2"
      >
        ♥
      </span>

      <motion.article
        initial={{ opacity: 0, y: 50, rotate: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: "spring", stiffness: 90, damping: 14 }}
        className={`mx-auto w-full max-w-xs rounded-sm bg-white p-3 pb-5 shadow-xl shadow-plum-800/15 ${
          right ? "md:col-start-2" : "md:col-start-1"
        }`}
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blush-100 via-lavender-100 to-peach-100">
          {memory.image ? (
            <Image
              src={memory.image}
              alt={memory.title}
              fill
              sizes="(max-width: 768px) 80vw, 320px"
              className="object-cover"
            />
          ) : (
            <span aria-hidden className="absolute inset-0 flex items-center justify-center text-7xl">
              {memory.emoji ?? "💗"}
            </span>
          )}
        </div>
        <p className="mt-3 text-xs font-semibold tracking-wider text-blush-700 uppercase">
          {memory.date}
        </p>
        <h3 className="font-script text-3xl font-bold text-plum-800">{memory.title}</h3>
        <p className="mt-1 text-base leading-relaxed text-plum-700">{memory.description}</p>
      </motion.article>
    </li>
  );
}
