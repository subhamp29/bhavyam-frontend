"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { KeyboardProvider, useKeyboard } from "@/context/KeyboardContext";
import { ActiveChatProvider } from "@/context/ActiveChatProvider";
import AuthGuard from "./AuthGuard";
import { logoutUser } from "@/lib/supabaseData";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tabBarOpen, setTabBarOpen] = useState(false);
  const { isStreaming } = useStreaming();
  const { inputFocused } = useKeyboard();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen h-[100dvh] w-screen flex items-center justify-center bg-bg-dark">
        <div className="text-accent-blue text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-y-auto lg:overflow-hidden bg-bg-dark flex flex-col">
      <ParticleBackground isStreaming={isStreaming} />
      <Header onToggleSheet={() => setSheetOpen((o) => !o)} sheetOpen={sheetOpen} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)] gap-5 p-5 pb-20 lg:pb-5 overflow-y-auto lg:overflow-hidden min-h-0">
        <StatsSidebar />
        {children}
      </div>

      <MobileTabBar open={tabBarOpen} onToggle={() => setTabBarOpen((o) => !o)} inputFocused={inputFocused} onLogout={handleLogout} />

      <MobileSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-500 transition hover:bg-red-500/10"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
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
      <KeyboardProvider>
        <ActiveChatProvider>
          <AuthGuard>
            <ShellInner>{children}</ShellInner>
          </AuthGuard>
        </ActiveChatProvider>
      </KeyboardProvider>
    </StreamingProvider>
  );
}
