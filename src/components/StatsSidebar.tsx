"use client";

import { Cpu } from "lucide-react";
import StatsPanel from "./StatsPanel";

export default function StatsSidebar() {
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
    </aside>
  );
}
