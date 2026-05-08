import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PYGAME_CURRICULUM = [
  { iso: "2026-06-02", label: "Tue Jun 2",  title: "Python + First Game Window", desc: "Learn variables, loops, and open your first Pygame window with shapes on screen." },
  { iso: "2026-06-03", label: "Wed Jun 3",  title: "Animation and Player Controls", desc: "Make objects move smoothly and respond to keyboard input." },
  { iso: "2026-06-04", label: "Thu Jun 4",  title: "Sprites and Collisions", desc: "Add character images, detect collisions, and build game logic." },
  { iso: "2026-06-09", label: "Tue Jun 9",  title: "Scoring and Sound", desc: "Create a scoreboard, add sound effects, and polish your game." },
  { iso: "2026-06-10", label: "Wed Jun 10", title: "Build Your Own Game", desc: "Design and build your own original game with guidance." },
  { iso: "2026-06-11", label: "Thu Jun 11", title: "Showcase Day", desc: "Present your finished game live — friends and family welcome!" },
];

export const ML_CURRICULUM = [
  { iso: "2026-06-16", label: "Tue Jun 16", title: "What is AI?", desc: "Explore how AI works through fun demos — teach a computer to recognize drawings!" },
  { iso: "2026-06-17", label: "Wed Jun 17", title: "Train Your First AI", desc: "Use Teachable Machine to train an AI that recognizes your hand gestures." },
  { iso: "2026-06-18", label: "Thu Jun 18", title: "Image Recognition Project", desc: "Build an AI that can identify objects — like sorting recycling vs trash!" },
  { iso: "2026-06-23", label: "Tue Jun 23", title: "Meet ChatGPT and AI Chatbots", desc: "Learn how chatbots work and build your own simple AI assistant." },
  { iso: "2026-06-24", label: "Wed Jun 24", title: "Build Your AI Project", desc: "Choose your own AI project — image classifier, chatbot, or creative tool." },
  { iso: "2026-06-25", label: "Thu Jun 25", title: "Showcase Day", desc: "Demo your AI creation live — impress your friends and family!" },
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
