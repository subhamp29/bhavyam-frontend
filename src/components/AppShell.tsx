"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ParticleBackground from "./ParticleBackground";
import Header from "./Header";
import StatsSidebar from "./StatsSidebar";
import StatsPanel from "./StatsPanel";
import TrendingPanel from "./TrendingPanel";
import MobileTabBar from "./MobileTabBar";
import MobileSheet from "./MobileSheet";
import LoginPage from "@/app/login/page";
import { StreamingProvider, useStreaming } from "@/context/StreamingContext";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tabBarOpen, setTabBarOpen] = useState(false);
  const { isStreaming } = useStreaming();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-dark">
        <div className="text-accent-blue text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-dark flex flex-col">
      <ParticleBackground isStreaming={isStreaming} />
      <Header onToggleSheet={() => setSheetOpen((o) => !o)} sheetOpen={sheetOpen} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)] gap-5 p-5 pb-0 lg:pb-5 overflow-hidden min-h-0">
        <StatsSidebar />
        {children}
      </div>

      <MobileTabBar open={tabBarOpen} onToggle={() => setTabBarOpen((o) => !o)} />

      <MobileSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <StatsPanel />
        {pathname === "/" && (
          <div className="mt-6 pt-6 border-t border-accent-blue/10">
            <TrendingPanel />
          </div>
        )}
      </MobileSheet>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StreamingProvider>
      <ShellInner>{children}</ShellInner>
    </StreamingProvider>
  );
}
