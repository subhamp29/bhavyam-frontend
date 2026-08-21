"use client";

import { ChevronDown, LayoutDashboard, History, Cpu, Sliders } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Engine", icon: LayoutDashboard, href: "/" },
  { label: "History", icon: History, href: "/history" },
  { label: "Models", icon: Cpu, href: "/models" },
  { label: "Protocols", icon: Sliders, href: "/protocols" },
];

type MobileTabBarProps = {
  open: boolean;
  onToggle: () => void;
};

export default function MobileTabBar({ open, onToggle }: MobileTabBarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Floating toggle arrow */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-16 left-4 z-[60] w-11 h-11 rounded-full border border-accent-blue/30 bg-blue-950/90 backdrop-blur-md text-slate-300 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-transform duration-300"
        aria-label={open ? "Hide navigation" : "Show navigation"}
      >
        <ChevronDown
          size={22}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Tab bar */}
      <nav
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-accent-blue/20 bg-blue-950/80 backdrop-blur-md pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${
                active ? "text-accent-blue" : "text-slate-500"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
