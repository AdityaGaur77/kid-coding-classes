import { useState, useEffect } from "react";
import { fbGetSettings, fbFindStudentByEmail, fbAddStudent, getFirebaseError, DEFAULT_SETTINGS, type Settings } from "@/lib/firebase";

export function SignupForm() {
  const [form, setForm] = useState({
    parentName: "", studentName: "", email: "", age: "", track: "pygame" as "pygame" | "ml", notes: ""
  });
  const [state, setState] = useState<{ type: "idle" | "success" | "error"; text: string }>({ type: "idle", text: "" });
  const [saving, setSaving] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  // Add this state at the top with your other useState calls
const [showQrOnly, setShowQrOnly] = useState(false);

  useEffect(() => {
    fbGetSettings().then(setSettings).catch(() => {});
  }, []);

  async function submit() {
    if (!form.parentName || !form.studentName || !form.email) {
      setState({ type: "error", text: "Parent name, student name, and email are required." });
      return;
    }
    setSaving(true);
    setState({ type: "idle", text: "" });
    setShowPaymentOptions(false);
    try {
      const existing = await fbFindStudentByEmail(form.email);
      if (existing) {
        setState({ type: "error", text: "That email is already in the system. Use the student portal or contact the instructor." });
        setSaving(false);
        return;
      }
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
      setForm({ parentName: "", studentName: "", email: "", age: "", track: "pygame", notes: "" });
      setShowPaymentOptions(true);
      setState({ type: "success", text: "Registration request received. Please pay using one of the two QR codes below. After payment is marked as paid, portal access will be activated." });
    } catch (error) {
      setState({ type: "error", text: getFirebaseError(error) });
    }
    setSaving(false);
  }

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
      
      {state.text && (
        <div className={`p-3.5 rounded-xl text-sm ${state.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {state.text}
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
