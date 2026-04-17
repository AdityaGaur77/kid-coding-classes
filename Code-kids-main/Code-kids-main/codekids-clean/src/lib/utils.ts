import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PYGAME_CURRICULUM = [
  { iso: "2026-06-09", label: "Tue Jun 9",  title: "Python Foundations",    desc: "Variables, loops, and functions — everything you need to start coding." },
  { iso: "2026-06-10", label: "Wed Jun 10", title: "Hello Pygame",           desc: "Open a game window and draw your first scene on screen." },
  { iso: "2026-06-11", label: "Thu Jun 11", title: "Animation and Motion",   desc: "Move objects smoothly with code and understand the game loop." },
  { iso: "2026-06-16", label: "Tue Jun 16", title: "Player Controls",        desc: "Handle keyboard and mouse input to make your character respond." },
  { iso: "2026-06-17", label: "Wed Jun 17", title: "Sprites and Images",     desc: "Import art assets and animate characters frame by frame." },
  { iso: "2026-06-18", label: "Thu Jun 18", title: "Collision and Scoring",  desc: "Detect collisions, collect items, and display a live scoreboard." },
  { iso: "2026-06-23", label: "Tue Jun 23", title: "Sound and Polish",       desc: "Add sound effects, music, menus, and a proper game-over screen." },
  { iso: "2026-06-24", label: "Wed Jun 24", title: "Final Project",          desc: "Design and build your own original game from scratch." },
  { iso: "2026-06-25", label: "Thu Jun 25", title: "Showcase",               desc: "Present your finished game live — friends and family welcome." },
];

export const ML_CURRICULUM = [
  { iso: "2026-06-09", label: "Tue Jun 9",  title: "Python for Data",        desc: "Core Python — lists, loops, and data types — tuned for AI work." },
  { iso: "2026-06-10", label: "Wed Jun 10", title: "What ML Actually Is",    desc: "How machines learn patterns from data — with no math required." },
  { iso: "2026-06-11", label: "Thu Jun 11", title: "First Classifier",       desc: "Build a model that recognizes patterns and makes predictions." },
  { iso: "2026-06-16", label: "Tue Jun 16", title: "Training vs Testing",    desc: "Understand overfitting, accuracy, and how to evaluate a model fairly." },
  { iso: "2026-06-17", label: "Wed Jun 17", title: "Neural Networks",        desc: "Layers, neurons, weights — the engine behind modern AI." },
  { iso: "2026-06-18", label: "Thu Jun 18", title: "How Computers See",      desc: "Pixels as data — how images become numbers a model can learn from." },
  { iso: "2026-06-23", label: "Tue Jun 23", title: "Image Recognition I",    desc: "Load a real image dataset and start training a convolutional model." },
  { iso: "2026-06-24", label: "Wed Jun 24", title: "Image Recognition II",   desc: "Tune your model, improve accuracy, and classify your own photos." },
  { iso: "2026-06-25", label: "Thu Jun 25", title: "Showcase",               desc: "Demo your image recognition model live — families welcome." },
];

export type Track = "pygame" | "ml";

export function trackMeta(track: Track) {
  return track === "ml"
    ? { name: "ML / AI", price: "$25 / week", total: "$75 total", color: "#0f766e", badge: "bg-teal-100 text-teal-700", curriculum: ML_CURRICULUM }
    : { name: "Pygame", price: "$25 / week", total: "$75 total", color: "#ea580c", badge: "bg-amber-100 text-amber-700", curriculum: PYGAME_CURRICULUM };
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
