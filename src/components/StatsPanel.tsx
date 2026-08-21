"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Cpu, Database, Zap, LayoutDashboard, Sliders, History as HistoryIcon } from "lucide-react";
import { getStats } from "@/lib/api";
import TiltCard from "./TiltCard";

type Stats = {
  total_messages: number;
  avg_response_time_ms: { overall: number | null; tracked: boolean } | null;
  db_size_mb: number | null;
  messages_per_day: { date: string; messages: number }[];
};

const navItems = [
  { label: "Neural Engine", icon: LayoutDashboard, href: "/" },
  { label: "History Log", icon: HistoryIcon, href: "/history" },
  { label: "Core Models", icon: Cpu, href: "/models" },
  { label: "Protocols", icon: Sliders, href: "/protocols" },
];

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      try {
        const data = await getStats();
        setStats({
          total_messages: data.total_messages,
          avg_response_time_ms: data.avg_response_time_ms,
          db_size_mb: data.db_size_mb,
          messages_per_day: data.messages_per_day || [],
        });
      } catch {
        // leave stats null so cards show fallback state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const avgMs = stats?.avg_response_time_ms?.overall;
  const latencyText = stats?.avg_response_time_ms?.tracked
    ? avgMs != null
      ? `${avgMs}ms`
      : "—"
    : "—";

  return (
    <div className="flex flex-col min-h-0">
      <nav className="space-y-1 p-4 shrink-0">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item w-full text-left ${active ? "active" : ""}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="space-y-3 pt-4">
          <TiltCard className="metric-card floating" style={{ animationDelay: "-1s" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-300">
                Total Requests
              </span>
              <Activity className="text-accent-blue text-lg" />
            </div>
            <div className="metric-value">
              {loading ? "..." : stats?.total_messages ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              messages in history
            </div>
          </TiltCard>

          <TiltCard className="metric-card floating" style={{ animationDelay: "-2.5s" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-pink-300">
                Model Latency
              </span>
              <Zap className="text-cyan-400 text-lg" />
            </div>
            <div className="metric-value">
              {loading ? "..." : latencyText}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              avg response time
            </div>
          </TiltCard>

          <TiltCard className="metric-card floating" style={{ animationDelay: "-4s" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-300">
                Storage Usage
              </span>
              <Database className="text-accent-purple text-lg" />
            </div>
            <div className="metric-value">
              {loading ? "..." : stats?.db_size_mb != null ? `${stats.db_size_mb} MB` : "—"}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              chat_history.db size
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
