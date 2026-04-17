type View = "home" | "schedule" | "portal" | "admin";

interface NavProps {
  view: View;
  setView: (v: View) => void;
  onSecretAdmin: () => void;
}

export function Nav({ view, setView, onSecretAdmin }: NavProps) {
  const links: [View, string][] = [
    ["home", "Home"],
    ["schedule", "Schedule"],
    ["portal", "Student Portal"],
  ];
  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-[1120px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <button
          data-testid="btn-logo"
          className="font-serif text-2xl text-slate-900 select-none focus:outline-none"
          onClick={() => { setView("home"); onSecretAdmin(); }}
        >
          Code<span className="text-blue-600">Kids</span>
        </button>
        <div className="flex gap-1 flex-wrap">
          {links.map(([id, label]) => (
            <button
              key={id}
              data-testid={`nav-${id}`}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                view === id
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
