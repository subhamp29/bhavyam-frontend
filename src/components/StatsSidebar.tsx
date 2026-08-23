"use client";

import { Cpu, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StatsPanel from "./StatsPanel";
import { logoutUser } from "@/lib/supabaseData";

export default function StatsSidebar() {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <aside className="hidden lg:flex w-[290px] flex-col h-full overflow-hidden z-10">
      {/* Profile Header */}
      <div className="glass-panel p-6 flex flex-col items-center text-center shrink-0">
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-red p-[3px] mb-4 pulse-glow">
          <div className="w-full h-full rounded-[20px] bg-bg-dark flex items-center justify-center">
            <Cpu size={32} className="text-accent-blue animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-bg-dark flex items-center justify-center shadow-lg">
            <span className="text-[10px] text-black font-bold">✓</span>
          </span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white mb-1">
          Bhavyam AI
        </h2>
        <div className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
          <span className="status-dot" /> Core Online
        </div>
      </div>

      {/* Nav + Stat Cards */}
      <div className="glass-panel flex-1 flex flex-col min-h-0 overflow-hidden mt-5">
        <StatsPanel />
      </div>

      {/* Logout */}
      <div className="p-4 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
