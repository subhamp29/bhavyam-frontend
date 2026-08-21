"use client";

import TrendingPanel from "./TrendingPanel";

export default function TrendingSidebar() {
  return (
    <aside className="hidden xl:flex w-[320px] flex-col h-full overflow-hidden">
      <div className="glass-panel flex-1 flex flex-col min-h-0 overflow-hidden p-5">
        <TrendingPanel />
      </div>
    </aside>
  );
}
