"use client";

import { Bot, ChevronUp, ChevronDown } from "lucide-react";

type HeaderProps = {
  onToggleSheet: () => void;
  sheetOpen: boolean;
};

export default function Header({ onToggleSheet, sheetOpen }: HeaderProps) {
  return (
    <header className="h-16 px-5 border-b border-accent-blue/20 bg-blue-950/20 backdrop-blur-md flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/15 border border-accent-blue/30 text-accent-blue">
          <Bot size={18} />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-white">
          Bhavyam <span className="text-accent-purple">AI</span>
        </span>
      </div>

      <button onClick={onToggleSheet} className="lg:hidden text-slate-300 p-1.5">
        {sheetOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>

      <button className="hidden lg:flex" title="Coming soon" disabled>
        Upgrade Core
      </button>
    </header>
  );
}
