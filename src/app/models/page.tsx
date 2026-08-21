"use client";

import { useEffect, useState } from "react";
import { Cpu, Globe, CheckCircle2 } from "lucide-react";
import { getModels, type ModelInfo } from "@/lib/api";

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    getModels()
      .then(setModels)
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
    setSelectedId(localStorage.getItem("bhavyam.model"));
  }, []);

  const setActive = (id: string) => {
    localStorage.setItem("bhavyam.model", id);
    setSelectedId(id);
  };

  return (
    <div className="glass-panel h-full flex flex-col p-6 overflow-hidden min-h-0">
      <h1 className="font-display text-xl font-bold text-white mb-4 shrink-0">Core Models</h1>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading && <p className="text-sm text-slate-500">Loading models…</p>}
        {!loading && models.length === 0 && (
          <p className="text-sm text-slate-500">No models available.</p>
        )}

        {models.map((m) => {
          const active = m.id === selectedId;
          return (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                active
                  ? "border-accent-blue/50 bg-accent-blue/5"
                  : "border-accent-blue/15 bg-blue-950/20 hover:border-accent-blue/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {m.backend === "local" ? (
                    <Cpu size={16} className="text-cyan" />
                  ) : (
                    <Globe size={16} className="text-accent-purple" />
                  )}
                  <span className="text-sm font-medium text-white">{m.display_name}</span>
                </div>
                {active && <CheckCircle2 size={16} className="text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-snug line-clamp-2">{m.description}</p>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-2 block">
                {m.backend}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
