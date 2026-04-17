import { useState, useEffect, useMemo } from "react";
import {
  fbGetStudents, fbGetSettings, fbAddStudent, fbFindStudentByEmail,
  fbUpdateStudent, fbDeleteStudent, fbUpdateSettings, getFirebaseError,
  DEFAULT_SETTINGS, type Student, type Settings
} from "@/lib/firebase";
import { trackMeta, type Track } from "@/lib/utils";

interface AdminProps {
  onExit: () => void;
}

export function Admin({ onExit }: AdminProps) {
  const [tab, setTab] = useState<"students" | "add" | "content" | "resources">("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [studentForm, setStudentForm] = useState({ name: "", email: "", parentName: "", age: "", track: "pygame" as Track, paid: false, notes: "" });
  const [recordingForm, setRecordingForm] = useState({ track: "pygame" as Track, title: "", date: "", url: "" });
  const [resourceForm, setResourceForm] = useState({ track: "pygame" as Track, title: "", type: "", url: "" });
  const [filters, setFilters] = useState({ track: "all", paid: "all", status: "all", search: "" });

  async function loadData() {
    setLoading(true);
    setMessage("");
    try {
      const [foundStudents, foundSettings] = await Promise.all([fbGetStudents(), fbGetSettings()]);
      setStudents(foundStudents);
      setSettings(foundSettings);
    } catch (error) {
      setMessage(getFirebaseError(error));
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const paid = students.filter((s) => s.paid).length;
    const revenue = students.filter((s) => s.paid).reduce((sum) => sum + 75, 0);
    return { total: students.length, paid, unpaid: students.length - paid, revenue };
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filters.track !== "all" && s.track !== filters.track) return false;
      if (filters.paid === "paid" && !s.paid) return false;
      if (filters.paid === "unpaid" && s.paid) return false;
      if (filters.status !== "all" && s.registrationStatus !== filters.status) return false;
      if (filters.search) {
        const needle = filters.search.toLowerCase();
        const hay = `${s.name} ${s.email} ${s.parentName} ${s.notes}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [students, filters]);

  async function addStudent() {
    if (!studentForm.name || !studentForm.email) { setMessage("Name and email are required."); return; }
    try {
      const existing = await fbFindStudentByEmail(studentForm.email);
      if (existing) { setMessage("That email is already registered."); return; }
      await fbAddStudent({ ...studentForm, source: "manual", registrationStatus: studentForm.paid ? "approved" : "payment-pending" });
      setStudentForm({ name: "", email: "", parentName: "", age: "", track: "pygame", paid: false, notes: "" });
      setMessage("Student added.");
      loadData();
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  async function togglePaid(student: Student) {
    try {
      const nextPaid = !student.paid;
      await fbUpdateStudent(student.id, { paid: nextPaid, registrationStatus: nextPaid ? "approved" : "payment-pending" });
      setStudents((prev) => prev.map((item) => item.id === student.id ? { ...item, paid: nextPaid, registrationStatus: nextPaid ? "approved" : "payment-pending" } : item));
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  async function updateStatus(student: Student, status: string) {
    try {
      await fbUpdateStudent(student.id, { registrationStatus: status });
      setStudents((prev) => prev.map((item) => item.id === student.id ? { ...item, registrationStatus: status } : item));
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  async function removeStudent(student: Student) {
    if (!confirm(`Remove ${student.name}?`)) return;
    try {
      await fbDeleteStudent(student.id);
      setStudents((prev) => prev.filter((item) => item.id !== student.id));
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  async function saveLinks() {
    try {
      await fbUpdateSettings({
        pygameZoom: settings.pygameZoom, mlZoom: settings.mlZoom, announcement: settings.announcement,
        paypalUrl: settings.paypalUrl, venmoUrl: settings.venmoUrl, paypalQrUrl: settings.paypalQrUrl,
        venmoQrUrl: settings.venmoQrUrl, paymentInstructions: settings.paymentInstructions
      });
      setMessage("Links and announcement saved.");
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  async function addRecording() {
    if (!recordingForm.title || !recordingForm.url) { setMessage("Recording title and URL are required."); return; }
    const field = recordingForm.track === "ml" ? "mlRecordings" : "pygameRecordings";
    const updated = [...(settings[field] || []), { title: recordingForm.title, date: recordingForm.date, url: recordingForm.url }];
    try {
      await fbUpdateSettings({ [field]: updated });
      setSettings((prev) => ({ ...prev, [field]: updated }));
      setRecordingForm({ track: "pygame", title: "", date: "", url: "" });
      setMessage("Recording added.");
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  async function removeRecording(track: Track, index: number) {
    const field = track === "ml" ? "mlRecordings" : "pygameRecordings";
    const updated = (settings[field] || []).filter((_, i) => i !== index);
    try {
      await fbUpdateSettings({ [field]: updated });
      setSettings((prev) => ({ ...prev, [field]: updated }));
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  async function addResource() {
    if (!resourceForm.title || !resourceForm.type || !resourceForm.url) { setMessage("Resource title, type, and URL are required."); return; }
    const field = resourceForm.track === "ml" ? "mlResources" : "pygameResources";
    const updated = [...(settings[field] || []), { title: resourceForm.title, type: resourceForm.type, url: resourceForm.url }];
    try {
      await fbUpdateSettings({ [field]: updated });
      setSettings((prev) => ({ ...prev, [field]: updated }));
      setResourceForm({ track: "pygame", title: "", type: "", url: "" });
      setMessage("Resource added.");
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  async function removeResource(track: Track, index: number) {
    const field = track === "ml" ? "mlResources" : "pygameResources";
    const updated = (settings[field] || []).filter((_, i) => i !== index);
    try {
      await fbUpdateSettings({ [field]: updated });
      setSettings((prev) => ({ ...prev, [field]: updated }));
    } catch (error) { setMessage(getFirebaseError(error)); }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white";
  const selectCls = `${inputCls}`;

  return (
    <div className="py-14 max-w-[1120px] mx-auto px-5 pb-24">
      <div className="flex justify-between gap-5 flex-wrap items-center mb-6">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">Admin Dashboard</div>
          <h1 className="font-serif text-4xl sm:text-5xl text-slate-900">Signups, payments, and portal content.</h1>
        </div>
        <div className="flex gap-2.5">
          <button data-testid="btn-refresh" className="border border-slate-200 bg-white text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50" onClick={loadData}>Refresh</button>
          <button data-testid="btn-signout" className="border border-slate-200 bg-white text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50" onClick={onExit}>Sign Out</button>
        </div>
      </div>

      {message && <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm mb-5">{message}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {[
          ["Total Signups", stats.total, "bg-slate-100 text-slate-600"],
          ["Paid", stats.paid, "bg-emerald-100 text-emerald-700"],
          ["Unpaid", stats.unpaid, "bg-amber-100 text-amber-700"],
          ["Revenue", `$${stats.revenue}`, "bg-teal-100 text-teal-700"]
        ].map(([label, value, cls]) => (
          <div key={String(label)} className="bg-white border border-slate-200 rounded-2xl p-5">
            <span className={`text-xs font-bold rounded-full px-3 py-1 ${cls}`}>{label}</span>
            <div className="font-serif text-4xl text-slate-900 mt-3">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 flex-wrap mb-6">
        {(["students", "add", "content", "resources"] as const).map((id) => (
          <button
            key={id}
            data-testid={`tab-${id}`}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === id ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            onClick={() => setTab(id)}
          >
            {id === "students" ? "Students" : id === "add" ? "Add Student" : id === "content" ? "Portal Content" : "Resources"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm flex gap-3 items-center">
          <span className="w-4 h-4 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin inline-block" />
          Loading data...
        </div>
      ) : (
        <>
          {tab === "students" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex gap-3 flex-wrap mb-5">
                <input data-testid="input-search" className={`flex-1 min-w-[220px] ${inputCls}`} placeholder="Search name, email, parent, notes" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                <select className={`w-44 ${selectCls}`} value={filters.track} onChange={(e) => setFilters({ ...filters, track: e.target.value })}>
                  <option value="all">All Tracks</option>
                  <option value="pygame">Pygame</option>
                  <option value="ml">ML / AI</option>
                </select>
                <select className={`w-44 ${selectCls}`} value={filters.paid} onChange={(e) => setFilters({ ...filters, paid: e.target.value })}>
                  <option value="all">All Payment</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
                <select className={`w-52 ${selectCls}`} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="all">All Status</option>
                  <option value="payment-pending">Payment Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {["Student", "Contact", "Track", "Status", "Payment", "Source", "Actions"].map((h) => (
                        <th key={h} className="text-left p-3 text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!filteredStudents.length && (
                      <tr><td colSpan={7} className="p-4 text-slate-400 text-sm">No students match the current filters.</td></tr>
                    )}
                    {filteredStudents.map((student) => (
                      <tr key={student.id} data-testid={`student-row-${student.id}`} className="hover:bg-slate-50">
                        <td className="p-3 border-b border-slate-100">
                          <div className="font-bold text-sm text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-400">{student.age ? `Age ${student.age}` : "Age not set"}</div>
                        </td>
                        <td className="p-3 border-b border-slate-100">
                          <div className="text-sm text-slate-700">{student.email}</div>
                          <div className="text-xs text-slate-400">{student.parentName || "No parent name"}</div>
                        </td>
                        <td className="p-3 border-b border-slate-100">
                          <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${student.track === "ml" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>{trackMeta(student.track).name}</span>
                        </td>
                        <td className="p-3 border-b border-slate-100">
                          <div className="flex gap-2 flex-wrap items-center">
                            <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${student.registrationStatus === "approved" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                              {student.registrationStatus === "approved" ? "approved" : "payment pending"}
                            </span>
                            {student.registrationStatus !== "approved" && (
                              <button className="text-xs font-bold border border-slate-200 bg-white text-slate-700 px-2.5 py-1 rounded-lg hover:bg-slate-50" onClick={() => updateStatus(student, "approved")}>Activate</button>
                            )}
                          </div>
                        </td>
                        <td className="p-3 border-b border-slate-100">
                          <button className={`text-xs font-bold px-3 py-1.5 rounded-lg ${student.paid ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-slate-900 text-white hover:bg-slate-800"}`} onClick={() => togglePaid(student)}>
                            {student.paid ? "Mark Unpaid" : "Mark Paid"}
                          </button>
                        </td>
                        <td className="p-3 border-b border-slate-100">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">{student.source}</span>
                          {student.notes && <div className="text-xs text-slate-400 mt-1.5">{student.notes}</div>}
                        </td>
                        <td className="p-3 border-b border-slate-100">
                          <button className="text-xs font-bold border border-slate-200 bg-white text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" onClick={() => removeStudent(student)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "add" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-3xl text-slate-900 mb-5">Add a student manually</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Student Name</label><input className={inputCls} value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label><input className={inputCls} value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Parent Name</label><input className={inputCls} value={studentForm.parentName} onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Age</label><input className={inputCls} value={studentForm.age} onChange={(e) => setStudentForm({ ...studentForm, age: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Track</label><select className={selectCls} value={studentForm.track} onChange={(e) => setStudentForm({ ...studentForm, track: e.target.value as Track })}><option value="pygame">Pygame</option><option value="ml">ML / AI</option></select></div>
                <div className="flex items-end"><label className="flex gap-3 items-center font-bold text-sm cursor-pointer"><input type="checkbox" checked={studentForm.paid} onChange={(e) => setStudentForm({ ...studentForm, paid: e.target.checked })} className="w-4 h-4" />Mark as paid</label></div>
              </div>
              <div className="mt-4"><label className="block text-xs font-bold text-slate-700 mb-1.5">Notes</label><textarea className={`${inputCls} min-h-[80px] resize-y`} value={studentForm.notes} onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })} /></div>
              <button className="mt-5 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800" onClick={addStudent}>Add Student</button>
            </div>
          )}

          {tab === "content" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-2xl text-slate-900 mb-5">Portal links</h2>
                <div className="flex flex-col gap-4">
                  {[
                    ["Pygame Zoom Link", "pygameZoom", "https://zoom.us/j/..."],
                    ["ML / AI Zoom Link", "mlZoom", "https://zoom.us/j/..."],
                    ["PayPal Payment Link", "paypalUrl", "https://paypal.me/..."],
                    ["Zelle Payment Link", "venmoUrl", "https://zellepay.com/..."],
                    ["PayPal QR Image URL", "paypalQrUrl", "https://.../paypal-qr.png"],
                    ["Zelle QR Image URL", "venmoQrUrl", "https://.../zelle-qr.png"]
                  ].map(([label, field, placeholder]) => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
                      <input className={inputCls} value={(settings[field as keyof Settings] as string) || ""} onChange={(e) => setSettings({ ...settings, [field]: e.target.value })} placeholder={placeholder} />
                    </div>
                  ))}
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Instructions</label><textarea className={`${inputCls} min-h-[80px] resize-y`} value={settings.paymentInstructions || ""} onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })} /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Portal Announcement</label><textarea className={`${inputCls} min-h-[80px] resize-y`} value={settings.announcement || ""} onChange={(e) => setSettings({ ...settings, announcement: e.target.value })} /></div>
                </div>
                <button className="mt-5 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800" onClick={saveLinks}>Save Portal Content</button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-2xl text-slate-900 mb-5">Add recording</h2>
                <div className="flex flex-col gap-4">
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Track</label><select className={selectCls} value={recordingForm.track} onChange={(e) => setRecordingForm({ ...recordingForm, track: e.target.value as Track })}><option value="pygame">Pygame</option><option value="ml">ML / AI</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label><input className={inputCls} value={recordingForm.title} onChange={(e) => setRecordingForm({ ...recordingForm, title: e.target.value })} placeholder="Week 1 - Class 1" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Date</label><input className={inputCls} value={recordingForm.date} onChange={(e) => setRecordingForm({ ...recordingForm, date: e.target.value })} placeholder="June 2, 2026" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Recording URL</label><input className={inputCls} value={recordingForm.url} onChange={(e) => setRecordingForm({ ...recordingForm, url: e.target.value })} placeholder="Drive or YouTube link" /></div>
                </div>
                <button className="mt-5 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800" onClick={addRecording}>Add Recording</button>

                {(["pygame", "ml"] as Track[]).map((t) => {
                  const field = t === "ml" ? "mlRecordings" : "pygameRecordings";
                  const list = settings[field] || [];
                  return (
                    <div key={t} className="mt-6">
                      <h3 className="font-bold text-slate-900 mb-3">{trackMeta(t).name} Recordings</h3>
                      {!list.length && <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">No recordings yet.</div>}
                      {list.map((item, index) => (
                        <div key={index} className="flex justify-between items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white mb-2">
                          <div>
                            <div className="font-bold text-sm text-slate-900">{item.title}</div>
                            <div className="text-xs text-slate-400">{item.date || "No date"}</div>
                          </div>
                          <div className="flex gap-2">
                            <a className="text-xs font-bold border border-slate-200 bg-white text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50" href={item.url} target="_blank" rel="noopener noreferrer">Open</a>
                            <button className="text-xs font-bold border border-slate-200 bg-white text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => removeRecording(t, index)}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "resources" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-2xl text-slate-900 mb-5">Add resource</h2>
                <div className="flex flex-col gap-4">
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Track</label><select className={selectCls} value={resourceForm.track} onChange={(e) => setResourceForm({ ...resourceForm, track: e.target.value as Track })}><option value="pygame">Pygame</option><option value="ml">ML / AI</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label><input className={inputCls} value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">Type</label><input className={inputCls} value={resourceForm.type} onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })} placeholder="Docs, Tool, Video, Asset" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1.5">URL</label><input className={inputCls} value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} /></div>
                </div>
                <button className="mt-5 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800" onClick={addResource}>Add Resource</button>
              </div>

              {(["pygame", "ml"] as Track[]).map((t) => {
                const field = t === "ml" ? "mlResources" : "pygameResources";
                const list = settings[field] || [];
                return (
                  <div key={t} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-lg mb-4">{trackMeta(t).name} Resources</h3>
                    {!list.length && <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">No resources yet.</div>}
                    {list.map((item, index) => (
                      <div key={index} className="flex justify-between items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white mb-2">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{item.title}</div>
                          <div className="text-xs text-slate-400">{item.type}</div>
                        </div>
                        <div className="flex gap-2">
                          <a className="text-xs font-bold border border-slate-200 bg-white text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50" href={item.url} target="_blank" rel="noopener noreferrer">Open</a>
                          <button className="text-xs font-bold border border-slate-200 bg-white text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => removeResource(t, index)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
