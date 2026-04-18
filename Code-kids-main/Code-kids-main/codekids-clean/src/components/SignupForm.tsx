import { useState, useEffect } from "react";
import { fbGetSettings, fbFindStudentByEmail, fbAddStudent, fbUpdateStudent, getFirebaseError, DEFAULT_SETTINGS, type Settings } from "@/lib/firebase";
import { CheckCircle2, Copy, Eye, EyeOff } from "lucide-react";

function generatePassword(): string {
  const words = ["Tiger", "Rocket", "Pixel", "Comet", "Storm", "Blaze", "Orbit", "Quasar", "Nova", "Spark"];
  const nums = Math.floor(100 + Math.random() * 900);
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}${nums}`;
}

export function SignupForm() {
  const [form, setForm] = useState({
    parentName: "", studentName: "", email: "", age: "", track: "pygame" as "pygame" | "ml", notes: ""
  });
  const [errorText, setErrorText] = useState("");
  const [saving, setSaving] = useState(false);
  const [registered, setRegistered] = useState<{ studentName: string; email: string; password: string } | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    fbGetSettings().then(setSettings).catch(() => {});
  }, []);

  async function submit() {
    if (!form.parentName || !form.studentName || !form.email) {
      setErrorText("Parent name, student name, and email are required.");
      return;
    }
    setSaving(true);
    setErrorText("");
    try {
      const existing = await fbFindStudentByEmail(form.email);
      if (existing) {
        setErrorText("That email is already in the system. Use the student portal or contact the instructor.");
        setSaving(false);
        return;
      }
      const password = generatePassword();
      await fbAddStudent({
        name: form.studentName.trim(),
        email: form.email.trim(),
        track: form.track,
        paid: false,
        notes: form.notes.trim(),
        age: form.age.trim(),
        parentName: form.parentName.trim(),
        source: "website",
        registrationStatus: "payment-pending"
      });
      // Store the password on the student record
      const created = await fbFindStudentByEmail(form.email.trim());
      if (created) {
        await fbUpdateStudent(created.id, { password } as Parameters<typeof fbUpdateStudent>[1]);
      }
      setRegistered({ studentName: form.studentName.trim(), email: form.email.trim(), password });
      setForm({ parentName: "", studentName: "", email: "", age: "", track: "pygame", notes: "" });
    } catch (error) {
      setErrorText(getFirebaseError(error));
    }
    setSaving(false);
  }

  function copyPassword() {
    if (!registered) return;
    navigator.clipboard.writeText(registered.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Post-registration success view ──
  if (registered) {
    return (
      <div className="mt-6 flex flex-col gap-5">
        {/* Success banner */}
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-800 text-sm">Registration received!</p>
            <p className="text-emerald-700 text-sm mt-0.5">
              Scan a QR code below to pay. Once confirmed, portal access will be activated.
            </p>
          </div>
        </div>

        {/* Portal password card */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-xs font-bold tracking-widest uppercase text-amber-600 mb-2">Save your portal password</p>
          <p className="text-amber-800 text-sm mb-3">
            Use <span className="font-bold">{registered.email}</span> and the password below to log in to the student portal.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-900 text-base tracking-wider">
              {showPass ? registered.password : "•".repeat(registered.password.length)}
            </div>
            <button
              onClick={() => setShowPass(!showPass)}
              className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-600 hover:bg-amber-100 transition-colors"
              title={showPass ? "Hide" : "Show"}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={copyPassword}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-amber-700 text-xs mt-2.5">Screenshot or write this down — you won&apos;t see it again on this page.</p>
        </div>

        {/* QR codes */}
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-3">Step 2 — Pay with PayPal or Zelle</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 rounded-2xl p-3 bg-white shadow-sm">
              <div className="font-bold text-slate-900 text-sm mb-2">PayPal</div>
              <img src="/paypal.jpeg" alt="PayPal QR code" className="w-full aspect-square object-cover rounded-xl border border-slate-100" />
            </div>
            <div className="border border-slate-200 rounded-2xl p-3 bg-white shadow-sm">
              <div className="font-bold text-slate-900 text-sm mb-2">Zelle</div>
              <img src="/zelle.jpeg" alt="Zelle QR code" className="w-full aspect-square object-cover rounded-xl border border-slate-100" />
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-2.5 text-center">Include the student name in the payment note so we can match it quickly.</p>
        </div>

        <button
          className="text-slate-400 text-sm text-center hover:text-slate-600 transition-colors py-1 underline"
          onClick={() => setRegistered(null)}
        >
          Register another student
        </button>
      </div>
    );
  }

  // ── Registration form ──
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Parent Name</label>
          <input data-testid="input-parent-name" className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Jane Smith" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Student Name</label>
          <input data-testid="input-student-name" className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Alex Smith" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Parent or Student Email</label>
          <input data-testid="input-email" className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="family@example.com" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Age</label>
          <input data-testid="input-age" className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="9" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Track</label>
        <select data-testid="select-track" className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white" value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value as "pygame" | "ml" })}>
          <option value="pygame">Pygame | $25/week</option>
          <option value="ml">ML / AI | $25/week</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes</label>
        <textarea data-testid="input-notes" className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-y min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything about experience level or schedule." />
      </div>

      {errorText && (
        <div className="p-3.5 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700">
          {errorText}
        </div>
      )}
      <button
        data-testid="btn-submit-registration"
        className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        onClick={submit}
        disabled={saving}
      >
        {saving ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" />
            Submitting...
          </>
        ) : "Submit Registration"}
      </button>
    </div>
  );
}
