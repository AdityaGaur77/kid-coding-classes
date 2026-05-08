import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PYGAME_CURRICULUM = [
  { iso: "2026-06-02", label: "Tue Jun 2",  title: "Launch Your Spaceship", desc: "Learn Python basics and draw your spaceship on screen with a starry background." },
  { iso: "2026-06-03", label: "Wed Jun 3",  title: "Dodge the Asteroids", desc: "Add keyboard controls to fly your ship and spawn asteroids to dodge." },
  { iso: "2026-06-04", label: "Thu Jun 4",  title: "Explosions and Collisions", desc: "Detect crashes, trigger explosion animations, and add extra lives." },
  { iso: "2026-06-09", label: "Tue Jun 9",  title: "Power-Ups and Scoring", desc: "Collect stars for points, add shields and speed boosts, display your score." },
  { iso: "2026-06-10", label: "Wed Jun 10", title: "Sound and Polish", desc: "Add laser sounds, explosions, background music, and a game over screen." },
  { iso: "2026-06-11", label: "Thu Jun 11", title: "Showcase Day", desc: "Play your finished Space Escape game live for friends and family!" },
];

export const ML_CURRICULUM = [
  { iso: "2026-06-16", label: "Tue Jun 16", title: "Discover AI Magic", desc: "Play with AI demos and learn how computers can recognize images and gestures." },
  { iso: "2026-06-17", label: "Wed Jun 17", title: "Train Your First Spell", desc: "Use Teachable Machine to teach your AI to recognize your first magic gesture." },
  { iso: "2026-06-18", label: "Thu Jun 18", title: "Build Your Spell Book", desc: "Train 3-4 different gesture spells — each one triggers a different magic effect!" },
  { iso: "2026-06-23", label: "Tue Jun 23", title: "Create the Magic Effects", desc: "Connect your spells to awesome visual effects — fireworks, confetti, lightning!" },
  { iso: "2026-06-24", label: "Wed Jun 24", title: "Polish Your Wand", desc: "Add sound effects, customize your spells, and practice your wizard performance." },
  { iso: "2026-06-25", label: "Thu Jun 25", title: "Showcase Day", desc: "Perform your AI magic show live — cast spells and amaze your family!" },
];

export type Track = "pygame" | "ml";

export function trackMeta(track: Track) {
  return track === "ml"
    ? { name: "ML / AI", price: "$25 / week", total: "$50 total", color: "#0f766e", badge: "bg-teal-100 text-teal-700", curriculum: ML_CURRICULUM }
    : { name: "Pygame", price: "$25 / week", total: "$50 total", color: "#ea580c", badge: "bg-amber-100 text-amber-700", curriculum: PYGAME_CURRICULUM };
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
