/**
 * ─────────────────────────────────────────────────────────────
 *  ALL personal content lives here. Edit this file and nothing else
 *  to make the app yours.
 * ─────────────────────────────────────────────────────────────
 */

export type Memory = {
  /** Shown above the title, free text ("June 2024", "The first rainy day"…) */
  date: string;
  title: string;
  description: string;
  /** Optional photo in /public/memories, e.g. "/memories/first-coffee.jpg" */
  image?: string;
  /** Shown instead of a photo when `image` is not set */
  emoji?: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  /** Index into `options` of the right answer */
  correctIndex: number;
  reactionIfRight: string;
  reactionIfWrong: string;
};

export type LoveConfig = {
  herName: string;
  myName: string;
  /** Optional: your phone number with country code (e.g. "+919876543210").
   *  When set, the celebration screen shows "Text me" and "Call me" buttons. */
  myPhone?: string;
  memories: Memory[];
  reasons: string[];
  quiz: QuizQuestion[];
  /** One line per sentence. Lines fade in one at a time. */
  finalMessage: string[];
  /** Optional background music in /public, e.g. "/song.mp3". Leave "" to hide the music button. */
  songUrl?: string;
};

export const love: LoveConfig = {
  herName: "Ammu",
  myName: "Your Secret Admirer", // ← put your name here
  myPhone: "",

  memories: [
    {
      date: "The very first day",
      title: "When I first saw you",
      description:
        "You laughed at something silly and I forgot what I was about to say. I still don't remember.",
      emoji: "✨",
    },
    {
      date: "A few weeks later",
      title: "Our first real conversation",
      description:
        "We talked for hours and it felt like five minutes. I went home smiling like an idiot.",
      emoji: "☕",
    },
    {
      date: "That rainy evening",
      title: "Sharing one umbrella",
      description:
        "Half of us got soaked, and somehow it was the best walk of my life.",
      emoji: "🌧️",
    },
    {
      date: "Your birthday",
      title: "Seeing you that happy",
      description:
        "You lit up the whole room. I decided right there that I wanted to keep seeing that smile.",
      emoji: "🎂",
    },
    {
      date: "Today",
      title: "This little website",
      description:
        "Because some things deserve more than a text message, Ammu.",
      emoji: "💌",
    },
  ],

  reasons: [
    "Your laugh is my favourite sound in the whole world.",
    "You make ordinary days feel like little adventures.",
    "You're kind to everyone, even when nobody is watching.",
    "The way your eyes light up when you talk about things you love.",
    "You're ridiculously smart and you don't even show off about it.",
    "You always know how to make me feel better.",
    "Your terrible jokes. Yes, even those.",
    "You're brave in ways you don't even notice.",
    "Talking to you feels like coming home.",
    "You're simply you, Ammu, and that's more than enough.",
  ],

  quiz: [
    {
      question: "Where did we first meet?",
      options: ["At college", "Through a friend", "At a café", "In my dreams"],
      correctIndex: 1,
      reactionIfRight: "Yesss! Best introduction ever 🥹",
      reactionIfWrong: "Close! It was through a friend. Remind me to thank them 😄",
    },
    {
      question: "What's my go-to order when we go out?",
      options: ["Cold coffee", "Masala chai", "Hot chocolate", "Whatever you're having"],
      correctIndex: 3,
      reactionIfRight: "You know me too well 😌",
      reactionIfWrong: "Honestly? Whatever you're having. Always.",
    },
    {
      question: "What do I think about most during the day?",
      options: ["Food", "Work", "You", "Cricket"],
      correctIndex: 2,
      reactionIfRight: "Obviously. It's always you 💕",
      reactionIfWrong: "Nope, it's you. It's always you 🙈",
    },
    {
      question: "What's my favourite thing about you?",
      options: ["Your smile", "Your heart", "Your voice", "All of the above"],
      correctIndex: 3,
      reactionIfRight: "Correct! Picking just one was impossible 😍",
      reactionIfWrong: "Trick question. It's all of the above 😌",
    },
  ],

  finalMessage: [
    "Ammu, I've wanted to say this for a while now.",
    "Every time we talk, my day gets a little brighter.",
    "I find myself smiling at my phone when your name shows up.",
    "I don't know exactly where this goes,",
    "but I know I'd love to find out together, with you.",
  ],

  songUrl: "/song.mp3",
};
