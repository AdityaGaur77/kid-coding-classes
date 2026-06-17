import { useState } from "react";
import { fbFindStudentsByEmail, fbGetSettings, getFirebaseError, DEFAULT_SETTINGS, type Student, type Settings } from "@/lib/firebase";
import { trackMeta, splitCurriculum, safeDateLabel } from "@/lib/utils";
import { Video, BookOpen, Link2, CalendarDays, CheckCircle2, Clock3, FileText } from "lucide-react";

const TRACK_THEME = {
  pygame: { bg: "from-violet-600 via-purple-600 to-indigo-700", light: "bg-amber-50 border-amber-200 text-amber-700", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", icon: "", name: "Pygame Game Dev" },
  ml:     { bg: "from-cyan-500 via-blue-600 to-indigo-700",     light: "bg-teal-50 border-teal-200 text-teal-700",   badge: "bg-teal-100 text-teal-700",   dot: "bg-teal-500",   icon: "", name: "ML / AI" },
};

export function Portal() {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    if (!email.trim() || !pin.trim()) return;
    setLoading(true);
    setError("");
    try {
      const [foundStudents, foundSettings] = await Promise.all([fbFindStudentsByEmail(email), fbGetSettings()]);
      if (foundStudents.length === 0) {
        setError("We couldn't find an account with that email. Double-check the email used at signup!");
        setLoading(false);
        return;
      }
      const matchedStudent = foundStudents.find((s) => s.pin && s.pin === pin.trim());
      if (!matchedStudent) {
        setError("Incorrect PIN. Check the email from your instructor, or contact them for your PIN.");
        setLoading(false);
        return;
      }
      if (!matchedStudent.paid && !matchedStudent.halfPaid) {
        setError("Your payment hasn't been received yet, so your portal access is paused. Once payment is confirmed, you'll be able to log in. Please reach out to your instructor if you've already paid.");
        setLoading(false);
        return;
      }
      setSettings(foundSettings);
      setStudent(matchedStudent);
      setStudents([]);
    } catch (err) {
      setError(getFirebaseError(err));
    }
    setLoading(false);
  }

  function reset() {
    setStudent(null);
    setStudents([]);
    setEmail("");
    setPin("");
    setError("");
  }

  const track = student?.track ?? "pygame";
  const meta = trackMeta(track);
  const theme = TRACK_THEME[track];
  const split = splitCurriculum(meta.curriculum);
  const zoom = track === "ml" ? settings.mlZoom : settings.pygameZoom;
  const recordings = track === "ml" ? (settings.mlRecordings || []) : (settings.pygameRecordings || []);
  const resources = track === "ml" ? (settings.mlResources || []) : (settings.pygameResources || []);
  const materials = track === "ml" ? (settings.mlMaterials || []) : (settings.pygameMaterials || []);

  return (
    <div className="min-h-screen bg-slate-50">
      {!student && students.length === 0 ? (
        /* ── Login screen ── */
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-slate-900 mb-3">Student Portal</h1>
          <p className="text-slate-500 text-lg mb-8 max-w-sm">Enter your email and the 4-digit PIN your instructor sent you.</p>

          <div className="w-full max-w-sm flex flex-col gap-3">
            <input
              data-testid="input-portal-email"
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-center"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="family@example.com"
            />
            <input
              data-testid="input-portal-pin"
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-center tracking-[0.5em] font-bold"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="PIN"
              maxLength={4}
              inputMode="numeric"
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

          <p className="mt-6 text-slate-400 text-xs max-w-xs">
            Don't have a PIN yet? Your instructor will email it to you after you sign up.
          </p>
        </div>
      ) : !student && students.length > 1 ? (
        /* ── Student selector (multiple kids per email) ── */
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-slate-900 mb-3">Who's logging in?</h1>
          <p className="text-slate-500 text-lg mb-8 max-w-sm">Select the student whose portal you'd like to open.</p>
          <div className="w-full max-w-sm flex flex-col gap-3">
            {students.map((s) => {
              const t = TRACK_THEME[s.track];
              return (
                <button
                  key={s.id}
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-5 text-left hover:border-blue-400 hover:shadow-md transition-all"
                  onClick={() => setStudent(s)}
                >
                  <div className="font-bold text-slate-900 text-lg">{s.name}</div>
                  <div className={`text-xs font-semibold mt-1 ${t.badge} inline-block rounded-full px-2.5 py-1`}>{t.name}</div>
                </button>
              );
            })}
          </div>
          <button className="mt-6 text-slate-400 text-sm hover:text-slate-600 transition-colors" onClick={reset}>
            ← Back
          </button>
        </div>
      ) : (
        /* ── Logged-in portal ── */
        <div className="max-w-[760px] mx-auto px-4 py-10 pb-24">

          {/* Welcome header */}
          <div className={`bg-gradient-to-br ${theme.bg} rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-lg`}>
            <div className="text-4xl mb-2">{theme.icon}</div>
            <div className="font-serif text-3xl sm:text-4xl leading-tight">Hey, {student!.name}! 👋</div>
            <div className="text-white/80 text-sm mt-1">{theme.name} · June 9 – June 25, 2026</div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${student!.paid ? "bg-white/20 text-white" : "bg-white/10 text-white/80"}`}>
                {student!.paid ? <><CheckCircle2 className="w-3.5 h-3.5" /> Paid</> : <><Clock3 className="w-3.5 h-3.5" /> Payment pending</>}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${student!.registrationStatus === "approved" ? "bg-white/20 text-white" : "bg-white/10 text-white/80"}`}>
                {student!.registrationStatus === "approved" ? "✓ Active" : "⏳ Pending review"}
              </span>
            </div>
          </div>

          

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

            {/* Class Materials — slide decks + code */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Class Materials</div>
                  <div className="text-slate-500 text-xs">Slide decks and code from each class</div>
                </div>
              </div>
              {materials.length ? (
                <div className="flex flex-col gap-2.5">
                  {materials.map((item, index) => (
                    <div
                      key={index}
                      data-testid={`material-${index}`}
                      className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{item.date || "Class materials"}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {item.slidesUrl && (
                          <a
                            data-testid={`material-slides-${index}`}
                            className="flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-200 transition-colors"
                            href={item.slidesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📊 Slides
                          </a>
                        )}
                        {item.codeUrl && (
                          <a
                            data-testid={`material-code-${index}`}
                            className="flex items-center gap-1.5 text-xs font-bold bg-teal-100 text-teal-700 rounded-full px-3 py-1.5 hover:bg-teal-200 transition-colors"
                            href={item.codeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            💻 Code
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-sm text-center">
                  📚 Slide decks and code will appear here after each class.
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
              onClick={reset}
            >
              ← Switch account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
