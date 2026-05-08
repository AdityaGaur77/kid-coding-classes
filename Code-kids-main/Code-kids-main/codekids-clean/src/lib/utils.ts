import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PYGAME_CURRICULUM = [
  { iso: "2026-06-02", label: "Tue Jun 2",  title: "Python Basics + Your First Game Window", desc: "Learn variables and loops while drawing your spaceship and starry background." },
  { iso: "2026-06-03", label: "Wed Jun 3",  title: "Movement and Controls", desc: "Make your ship fly with keyboard controls and spawn asteroids to dodge." },
  { iso: "2026-06-04", label: "Thu Jun 4",  title: "Collisions and Game Logic", desc: "Detect crashes, trigger explosion animations, and add a lives system." },
  { iso: "2026-06-09", label: "Tue Jun 9",  title: "Power-Ups and Scoring", desc: "Collect stars for points, add shields and speed boosts, build a scoreboard." },
  { iso: "2026-06-10", label: "Wed Jun 10", title: "Sound Effects and Polish", desc: "Add laser sounds, explosion effects, background music, and game over screen." },
  { iso: "2026-06-11", label: "Thu Jun 11", title: "Showcase Day", desc: "Play your finished game live for friends and family!" },
];

export const ML_CURRICULUM = [
  { iso: "2026-06-16", label: "Tue Jun 16", title: "What is AI?", desc: "Explore how AI works through fun demos and learn how computers recognize images." },
  { iso: "2026-06-17", label: "Wed Jun 17", title: "Train Your First AI Model", desc: "Use Teachable Machine to train an AI that recognizes your hand gestures." },
  { iso: "2026-06-18", label: "Thu Jun 18", title: "Build Your Gesture Library", desc: "Train your AI to recognize 3-4 different gestures for your interactive app." },
  { iso: "2026-06-23", label: "Tue Jun 23", title: "Connect AI to Visual Effects", desc: "Link your gestures to trigger cool effects like fireworks, confetti, and animations!" },
  { iso: "2026-06-24", label: "Wed Jun 24", title: "Sound and Polish", desc: "Add sound effects, customize your app, and practice your demo." },
  { iso: "2026-06-25", label: "Thu Jun 25", title: "Showcase Day", desc: "Demo your AI creation live and amaze your friends and family!" },
];

export type Track = "pygame" | "ml";

export function trackMeta(track: Track) {
  return track === "ml"
    ? { name: "AI + Image Recognition", price: "$25 / week", total: "$50 total", color: "#0f766e", badge: "bg-teal-100 text-teal-700", curriculum: ML_CURRICULUM }
    : { name: "Games with Python", price: "$25 / week", total: "$50 total", color: "#ea580c", badge: "bg-amber-100 text-amber-700", curriculum: PYGAME_CURRICULUM };
}

export function safeDateLabel(iso: string): string {
  return new Date(iso + "T09:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export function splitCurriculum(curriculum: typeof PYGAME_CURRICULUM) {
  const today = new Date();
  const completed: typeof curriculum = [];
  const upcoming: typeof curriculum = [];
  curriculum.forEach((item) => {
    const itemDate = new Date(item.iso + "T23:59:59");
    if (itemDate < today) completed.push(item);
    else upcoming.push(item);
  });
  return { completed, upcoming };
}
