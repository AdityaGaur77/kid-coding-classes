import { useState } from "react";
import { PYGAME_CURRICULUM, ML_CURRICULUM, type Track } from "@/lib/utils";

const WEEK_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500", label: "text-blue-600" },
  { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", dot: "bg-violet-500", label: "text-violet-600" },
  { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-100 text-teal-700", dot: "bg-teal-500", label: "text-teal-600" },
  { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", label: "text-amber-600" },
];

function groupByWeek<T extends { iso: string }>(lessons: T[]): T[][] {
  const weeks: T[][] = [];
  let current: T[] = [];
  let lastMonday = "";
  for (const lesson of lessons) {
    const date = new Date(lesson.iso + "T00:00:00");
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    const mondayStr = monday.toISOString().slice(0, 10);
    if (mondayStr !== lastMonday) {
      if (current.length) weeks.push(current);
      current = [];
      lastMonday = mondayStr;
    }
    current.push(lesson);
  }
  if (current.length) weeks.push(current);
  return weeks;
}

function weekLabel(week: { iso: string }[]): string {
  const start = new Date(week[0].iso + "T00:00:00");
  const end = new Date(week[week.length - 1].iso + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

const DAY_LABELS: Record<number, string> = { 2: "Tue", 3: "Wed", 4: "Thu" };

export function Schedule() {
  const [track, setTrack] = useState<Track>("pygame");
  const curriculum = track === "ml" ? ML_CURRICULUM : PYGAME_CURRICULUM;
  const weeks = groupByWeek(curriculum);

  const isShowcase = (title: string) => title.toLowerCase().includes("showcase");
  const isFinal = (title: string) => title.toLowerCase().includes("final project");

  return (
    <div className="py-16">
      <div className="max-w-[900px] mx-auto px-5">
        <div className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">Schedule</div>
        <h1 className="font-serif text-4xl sm:text-5xl text-slate-900 leading-tight">9 classes. 3 weeks. One real project.</h1>
        <p className="mt-3 text-slate-500 max-w-xl">Tue, Wed, and Thu — June 9 through June 25, 2026. Every track ends with a live showcase.</p>

        <div className="flex gap-3 flex-wrap mt-8 mb-8">
          <button
            data-testid="btn-track-pygame"
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${track === "pygame" ? "bg-amber-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-200"}`}
            onClick={() => setTrack("pygame")}
          >
            Pygame — Game Dev
          </button>
          <button
            data-testid="btn-track-ml"
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${track === "ml" ? "bg-teal-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-200"}`}
            onClick={() => setTrack("ml")}
          >
            ML / AI — Machine Learning
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {weeks.map((week, wi) => {
            const colors = WEEK_COLORS[wi % WEEK_COLORS.length];
            const weekNum = wi + 1;
            return (
              <div key={wi} className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden`}>
                <div className={`px-5 py-3 flex items-center gap-3 border-b ${colors.border}`}>
                  <span className={`text-xs font-bold tracking-widest uppercase ${colors.label}`}>
                    Week {weekNum}
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-slate-500 text-xs font-medium">{weekLabel(week)}</span>
                  {weekNum === 4 && (
                    <span className="ml-auto text-xs font-bold bg-white/80 border border-current text-amber-600 rounded-full px-2.5 py-0.5">
                      Final Week
                    </span>
                  )}
                </div>
                <div className="divide-y divide-white/60">
                  {week.map((lesson, li) => {
                    const dayNum = new Date(lesson.iso + "T00:00:00").getDay();
                    const dayLabel = DAY_LABELS[dayNum] ?? lesson.label.split(" ")[0];
                    const lessonNum = weeks.slice(0, wi).reduce((s, w) => s + w.length, 0) + li + 1;
                    const showcase = isShowcase(lesson.title);
                    const finalDay = isFinal(lesson.title);

                    return (
                      <div
                        key={lesson.iso}
                        data-testid={`schedule-row-${lesson.iso}`}
                        className="flex items-start gap-4 px-5 py-4 bg-white/50 hover:bg-white/80 transition-colors"
                      >
                        <div className="flex flex-col items-center gap-1 min-w-[44px] pt-0.5">
                          <span className={`text-xs font-bold uppercase ${colors.label}`}>{dayLabel}</span>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${colors.dot}`}>
                            {lessonNum}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{lesson.title}</span>
                            {showcase && (
                              <span className="text-xs font-bold bg-amber-100 text-amber-700 rounded-full px-2.5 py-0.5">Showcase</span>
                            )}
                            {finalDay && !showcase && (
                              <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${colors.badge}`}>Project</span>
                            )}
                          </div>
                          <div className="text-slate-500 text-sm mt-0.5">{lesson.desc}</div>
                        </div>
                        <div className="text-xs text-slate-400 shrink-0 pt-1 hidden sm:block">
                          {new Date(lesson.iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ["9 lessons", "One per class day, Tue / Wed / Thu"],
            ["3 weeks", "June 9 through June 25"],
            ["Live showcase", "Final class is a live demo day"]
          ].map(([title, sub]) => (
            <div key={title} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <div className="font-serif text-2xl text-slate-900">{title}</div>
              <div className="text-slate-500 text-xs mt-1">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
