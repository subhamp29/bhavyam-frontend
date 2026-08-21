"use client";

import { MessageSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ConversationSummary } from "@/lib/api";

type ThreadsSidebarProps = {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  isStreaming: boolean;
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ThreadsSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  isStreaming,
}: ThreadsSidebarProps) {
  return (
    <aside className="hidden xl:flex w-[320px] flex-col gap-5 z-10 h-full overflow-hidden">
      {/* Threads Header + Scrollable List */}
      <div className="glass-panel flex-1 flex flex-col min-h-0">
        <div className="p-5 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-purple-300">
              Neural Threads
            </h3>
            <button
              onClick={onNewChat}
              className="text-xs font-bold text-accent-blue hover:text-white transition-colors"
            >
              + New
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-2 pr-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted text-center py-6">
              No threads yet. Start a conversation.
            </p>
          ) : (
            conversations.map((c) => {
              const active = c.id === activeId;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-all border mb-2",
                    active
                      ? "border-accent-blue/50 bg-blue-950/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "border-white/5 bg-white/[0.02] hover:border-accent-purple/30 hover:bg-white/[0.04]",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                      active
                        ? "border-accent-blue/40 bg-accent-blue/15 text-accent-blue"
                        : "border-white/10 bg-white/5 text-muted",
                    )}
                  >
                    <MessageSquare size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-semibold",
                        active ? "text-white" : "text-slate-200",
                      )}
                    >
                      {c.title || "New Chat"}
                    </p>
                    {c.preview && (
                      <p className="truncate text-xs text-muted mt-0.5">
                        {c.preview}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      modified {timeAgo(c.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.id);
                    }}
                    className="shrink-0 rounded-md p-1 text-muted opacity-0 transition-opacity hover:bg-accent-red/15 hover:text-accent-red group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Neural Uplink Progress */}
      <div className="glass-panel p-5 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-300">
            Neural Uplink
          </span>
          <span
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              isStreaming ? "bg-accent-blue animate-ping" : "bg-emerald-500",
            )}
          />
        </div>
        <div className="w-full h-2 bg-blue-950/60 rounded-full overflow-hidden p-[1px] border border-blue-900/50">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              isStreaming
                ? "bg-gradient-to-r from-accent-blue via-accent-purple to-accent-red w-3/4"
                : "bg-gradient-to-r from-accent-blue via-accent-purple to-accent-red w-1/3",
            )}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-mono">
          {isStreaming ? "Streaming active..." : "Standby — awaiting input"}
        </p>
      </div>
    </aside>
  );
}
