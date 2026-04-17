interface AdminModalProps {
  adminPass: string;
  setAdminPass: (v: string) => void;
  adminError: string;
  onSubmit: () => void;
  onClose: () => void;
}

export function AdminModal({ adminPass, setAdminPass, adminError, onSubmit, onClose }: AdminModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-5 z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">Admin</div>
        <h2 className="font-serif text-3xl text-slate-900 mb-2">Enter password</h2>
        <p className="text-slate-500 text-sm mb-5">Enter the admin password to open the dashboard.</p>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
        <input
          data-testid="input-admin-password"
          className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          type="password"
          value={adminPass}
          onChange={(e) => setAdminPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Admin password"
        />
        {adminError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {adminError}
          </div>
        )}
        <div className="flex gap-2.5 mt-5">
          <button
            data-testid="btn-admin-submit"
            className="flex-1 bg-slate-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-slate-800 transition-colors"
            onClick={onSubmit}
          >
            Open Dashboard
          </button>
          <button
            data-testid="btn-admin-close"
            className="bg-slate-100 text-slate-700 rounded-xl px-4 py-3 font-bold text-sm hover:bg-slate-200 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
