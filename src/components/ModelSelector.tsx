"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Cpu, Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ModelInfo } from "@/lib/api";

export default function ModelSelector({
  models,
  value,
  onChange,
}: {
  models: ModelInfo[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = models.find((m) => m.id === value);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (models.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-hairline bg-panel px-3 py-1.5 text-sm text-ink/90 transition-colors hover:border-violet/50 hover:text-ink"
      >
        {selected?.backend === "local" ? (
          <Cpu size={14} className="text-cyan" />
        ) : (
          <Globe size={14} className="text-violet" />
        )}
        <span className="max-w-[10rem] truncate font-medium">
          {selected?.display_name ?? "Select model"}
        </span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 z-30 mt-2 w-72 overflow-hidden rounded-xl border border-hairline bg-panel-2 p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
          >
            {models.map((m) => {
              const active = m.id === value;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                    active ? "bg-violet/15" : "hover:bg-white/5",
                  )}
                >
                  <div className="mt-0.5">
                    {m.backend === "local" ? (
                      <Cpu size={15} className="text-cyan" />
                    ) : (
                      <Globe size={15} className="text-violet" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-ink">
                        {m.display_name}
                      </span>
                      {active && <Check size={13} className="text-violet" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">
                      {m.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
