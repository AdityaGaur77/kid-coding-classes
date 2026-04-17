import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Home } from "@/pages/Home";
import { Schedule } from "@/pages/Schedule";
import { Portal } from "@/pages/Portal";
import { Admin } from "@/pages/Admin";
import { AdminModal } from "@/components/AdminModal";

const ADMIN_PASS = "admin2026";

export default function App() {
  const [view, setView] = useState<"home" | "schedule" | "portal" | "admin">("home");
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminAccess, setAdminAccess] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    if (!logoClicks) return;
    const timer = setTimeout(() => setLogoClicks(0), 700);
    return () => clearTimeout(timer);
  }, [logoClicks]);

  function handleSecretAdmin() {
    setLogoClicks((count) => {
      const next = count + 1;
      if (next >= 3) {
        setAdminModalOpen(true);
        setAdminError("");
        setAdminPass("");
        return 0;
      }
      return next;
    });
  }

  function submitAdminAccess() {
    if (adminPass === ADMIN_PASS) {
      setAdminAccess(true);
      setAdminModalOpen(false);
      setAdminError("");
      setView("admin");
    } else {
      setAdminError("Incorrect password.");
    }
  }

  function exitAdmin() {
    setAdminAccess(false);
    setView("home");
  }

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Nav view={view} setView={setView} onSecretAdmin={handleSecretAdmin} />
          <main className="flex-1">
            {view === "home" && <Home setView={setView} />}
            {view === "schedule" && <Schedule />}
            {view === "portal" && <Portal />}
            {view === "admin" && adminAccess && <Admin onExit={exitAdmin} />}
          </main>
          <Footer />
        </div>

        {adminModalOpen && (
          <AdminModal
            adminPass={adminPass}
            setAdminPass={setAdminPass}
            adminError={adminError}
            onSubmit={submitAdminAccess}
            onClose={() => setAdminModalOpen(false)}
          />
        )}
        <Toaster />
      </TooltipProvider>
    </WouterRouter>
  );
}
