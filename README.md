# For Ammu 💌

A small, cinematic, mobile-first story that ends with one question:
**"Ammu, shall we start seeing each other?"** (The "No" button can't be pressed.)

Built with Next.js (App Router, TypeScript), Tailwind CSS v4, Framer Motion and canvas-confetti.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. To try it as a phone would, open Chrome DevTools → device mode and
pick 360×740 (Android) or 390×844 (iPhone 12/13/14).

To open it on your actual phone (same Wi-Fi), use the "Network" URL that `npm run dev` prints.

### Setting it up from scratch

```bash
npx create-next-app@latest ilu --typescript --tailwind --app --src-dir
cd ilu
npm install framer-motion canvas-confetti
npm install -D @types/canvas-confetti
```

## Make it yours: `src/config/love.ts`

Everything personal lives in that one file:

| Field          | What it is                                                                  |
| -------------- | --------------------------------------------------------------------------- |
| `herName`      | Her name/nickname, used everywhere ("Ammu")                                 |
| `myName`       | **Your name**, shown on the celebration screen                              |
| `myPhone`      | Optional. With a number (e.g. `"+919876543210"`), "Text me" and "Call me" buttons appear |
| `memories`     | Timeline cards: `{ date, title, description, image?, emoji? }`              |
| `reasons`      | The "Reasons I like you" cards (any number)                                 |
| `quiz`         | `{ question, options, correctIndex, reactionIfRight, reactionIfWrong }`     |
| `finalMessage` | Your heartfelt message, **one line per array item** (each fades in alone)    |
| `songUrl`      | Optional background music, e.g. `"/song.mp3"`. Use `""` to hide the button  |

### Adding photos

1. Put images in `public/memories/` (e.g. `public/memories/first-coffee.jpg`).
2. Reference them in a memory: `image: "/memories/first-coffee.jpg"`.

Square-ish photos look best in the polaroid frames. Keep each one under ~500 KB so it loads
quickly on mobile data. Memories without an `image` show their `emoji` instead.

### Adding music

Put an mp3 at `public/song.mp3` (or change `songUrl`). A music button appears at the bottom
right. Music stays off until she taps it, because mobile browsers block autoplay. If the file
is missing, the button hides itself.

## Testing tips

- Saying **Yes** is saved in `localStorage`, so revisiting jumps straight to the celebration.
  To start over: DevTools → Application → Local Storage → delete `love-answer`
  (or open the page in a private window).
- "Relive our story" on the celebration screen replays from the envelope without forgetting
  the answer.

## Deploy free on Vercel (to get a link for Ammu)

1. Push this folder to a GitHub repo (it can be private):
   ```bash
   git add -A && git commit -m "For Ammu"
   git remote add origin https://github.com/<you>/for-ammu.git
   git push -u origin master
   ```
2. Go to https://vercel.com, sign in with GitHub, and click **Add New → Project**.
3. Import the repo and click **Deploy**. No settings to change.
4. You get a URL like `https://for-ammu.vercel.app`. Rename it under
   Project → Settings → Domains if you want something cuter.
5. Open it on your own phone first, then send it to her. 💖

Every push to GitHub redeploys automatically.

Or use the CLI without GitHub: `npx vercel` (and `npx vercel --prod` for the final link).

## Project structure

```
src/
  app/
    page.tsx            Scene controller (state machine + AnimatePresence)
    layout.tsx          Fonts (Dancing Script + Inter), viewport and safe-area setup
    globals.css         Romantic palette, keyframes, safe-area utilities
  config/love.ts        ← all personal content
  components/
    scenes/             Envelope, Intro, Timeline, ReasonsDeck, HeartGame,
                        Quiz, FinalMessage, BigQuestion, Celebration
    effects/            FloatingHearts, HeartCursor, Typewriter, confetti helpers
    DodgingNoButton.tsx The un-clickable "No"
    LoveButton.tsx      Shared pink call-to-action button
    MusicToggle.tsx     Floating music button with equalizer icon
    ProgressHearts.tsx  Heart dots showing story progress
```
