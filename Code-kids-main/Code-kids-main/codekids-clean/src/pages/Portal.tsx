import { useState } from "react";
import { fbFindStudentByEmail, fbGetSettings, getFirebaseError, DEFAULT_SETTINGS, type Student, type Settings } from "@/lib/firebase";
import { trackMeta, splitCurriculum, safeDateLabel } from "@/lib/utils";
import { Video, BookOpen, Link2, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";

const TRACK_THEME = {
  pygame: { bg: "from-amber-400 to-orange-500", light: "bg-amber-50 border-amber-200 text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", icon: "", name: "Pygame Game Dev" },
  ml:     { bg: "from-teal-500 to-blue-600",   light: "bg-teal-50 border-teal-200 text-teal-700",   badge: "bg-teal-100 text-teal-700",   dot: "bg-teal-500",   icon: "", name: "ML / AI" },
};

export function Portal() {
  const [email, setEmail] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const [foundStudent, foundSettings] = await Promise.all([fbFindStudentByEmail(email), fbGetSettings()]);
      if (!foundStudent) {
        setStudent(null);
        setSettings(DEFAULT_SETTINGS);
        setError("We couldn't find an account with that email. Double-check the email used at signup!");
        setLoading(false);
        return;
      }
      setStudent(foundStudent);
      setSettings(foundSettings);
    } catch (err) {
      setStudent(null);
      setSettings(DEFAULT_SETTINGS);
      setError(getFirebaseError(err));
    }
    setLoading(false);
  }

  const track = student?.track ?? "pygame";
  const meta = trackMeta(track);
  const theme = TRACK_THEME[track];
  const split = splitCurriculum(meta.curriculum);
  const zoom = track === "ml" ? settings.mlZoom : settings.pygameZoom;
  const recordings = track === "ml" ? (settings.mlRecordings || []) : (settings.pygameRecordings || []);
  const resources = track === "ml" ? (settings.mlResources || []) : (settings.pygameResources || []);
  const accessReady = !!student && student.paid && student.registrationStatus === "approved";

  return (
    <div className="min-h-screen bg-slate-50">
      {!student ? (
        /* ── Login screen ── */
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 text-center">
         
          <h1 className="font-serif text-4xl sm:text-5xl text-slate-900 mb-3">Student Portal</h1>
          <p className="text-slate-500 text-lg mb-8 max-w-sm">Enter the email your parent used when signing up.</p>

          <div className="w-full max-w-sm flex flex-col gap-3">
            <input
              data-testid="input-portal-email"
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-center"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="family@example.com"
            />
            <button
              data-testid="btn-open-portal"
              className="w-full bg-blue-600 text-white rounded-2xl px-6 py-4 font-bold text-base hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              onClick={lookup}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" />
                  Looking you up...
                </>
              ) : "Open My Portal →"}
            </button>
          </div>

          {error && (
            <div className="mt-5 w-full max-w-sm p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
              😕 {error}
            </div>
          )}
        </div>
      ) : (
        /* ── Logged-in portal ── */
        <div className="max-w-[760px] mx-auto px-4 py-10 pb-24">

          {/* Welcome header */}
          <div className={`bg-gradient-to-br ${theme.bg} rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-lg`}>
            <div className="text-4xl mb-2">{theme.icon}</div>
            <div className="font-serif text-3xl sm:text-4xl leading-tight">Hey, {student.name}! 👋</div>
            <div className="text-white/80 text-sm mt-1">{theme.name} · June 9 – June 25, 2026</div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${student.paid ? "bg-white/20 text-white" : "bg-white/10 text-white/80"}`}>
                {student.paid ? <><CheckCircle2 className="w-3.5 h-3.5" /> Paid</> : <><Clock3 className="w-3.5 h-3.5" /> Payment pending</>}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${student.registrationStatus === "approved" ? "bg-white/20 text-white" : "bg-white/10 text-white/80"}`}>
                {student.registrationStatus === "approved" ? "✓ Active" : "⏳ Pending review"}
              </span>
            </div>
          </div>

          {settings.announcement && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm mb-6 font-medium">
              📢 {settings.announcement}
            </div>
          )}

          {!accessReady ? (
            /* ── Pending state ── */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="font-serif text-2xl text-slate-900 mb-2">Almost there!</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">Once your payment is confirmed, your Zoom link, recordings, and class materials will appear here.</p>
              {settings.paymentInstructions && (
                <p className="mt-4 text-slate-600 text-sm">{settings.paymentInstructions}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">

              {/* Join Class — Big CTA */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Join Class</div>
                    <div className="text-slate-500 text-xs">Same Zoom link every day</div>
                  </div>
                </div>
                {zoom ? (
                  <a
                    data-testid="link-zoom"
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-base hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                    href={zoom}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🖥️ Open Zoom Link
                  </a>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm text-center font-medium">
                    📅 Zoom link will appear here before the first class.
                  </div>
                )}
              </div>

              {/* Next Class */}
              {split.upcoming.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Next Class</div>
                      <div className="text-slate-500 text-xs">Coming up soon</div>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <div className="font-bold text-slate-900 text-lg">{split.upcoming[0].title}</div>
                    <div className="text-emerald-700 text-sm mt-1 font-medium">{safeDateLabel(split.upcoming[0].iso)}</div>
                    <div className="text-slate-500 text-sm mt-1">{split.upcoming[0].desc}</div>
                  </div>
                  {split.upcoming.length > 1 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {split.upcoming.slice(1).map((item) => (
                        <div key={item.iso} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-700 text-sm font-medium">{item.title}</span>
                          <span className="text-xs text-slate-400 shrink-0">{safeDateLabel(item.iso)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recordings */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Class Recordings</div>
                    <div className="text-slate-500 text-xs">Watch or rewatch any class</div>
                  </div>
                </div>
                {recordings.length ? (
                  <div className="flex flex-col gap-2.5">
                    {recordings.map((item, index) => (
                      <a
                        key={index}
                        data-testid={`recording-${index}`}
                        className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-colors group"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors flex items-center justify-center text-lg shrink-0">▶️</div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                            <div className="text-slate-400 text-xs mt-0.5">{item.date || "Class recording"}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-purple-100 text-purple-700 rounded-full px-3 py-1.5 shrink-0 group-hover:bg-purple-200 transition-colors">Watch</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-sm text-center">
                    🎬 Recordings will appear here after each class.
                  </div>
                )}
              </div>

              {/* Resources */}
              {resources.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Resources</div>
                      <div className="text-slate-500 text-xs">Helpful links and materials</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resources.map((resource, index) => (
                      <a
                        key={`${resource.title}-${index}`}
                        data-testid={`resource-${index}`}
                        className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 transition-colors group"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-colors flex items-center justify-center text-lg shrink-0">📄</div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{resource.title}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{resource.type}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed classes */}
              {split.completed.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Completed Classes</div>
                      <div className="text-slate-500 text-xs">{split.completed.length} class{split.completed.length !== 1 ? "es" : ""} done — great work!</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {split.completed.map((item) => (
                      <div key={item.iso} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-slate-700 text-sm font-medium flex-1">{item.title}</span>
                        <span className="text-xs text-slate-400 shrink-0">{safeDateLabel(item.iso)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="text-slate-400 text-sm text-center hover:text-slate-600 transition-colors py-2"
                onClick={() => setStudent(null)}
              >
                ← Switch account
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
