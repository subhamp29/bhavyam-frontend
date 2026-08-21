"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Sparkles, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ConversationSummary } from "@/lib/api";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onClose,
  showClose,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  showClose?: boolean;
}) {
  return (
    <div className="flex h-full w-72 flex-col border-r border-hairline bg-panel">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-violet),var(--color-cyan))] text-white shadow-[0_8px_24px_-8px_rgba(124,92,255,0.6)]">
            <Sparkles size={18} />
          </div>
          <div className="font-display text-lg font-semibold tracking-tight">
            Bhavyam <span className="text-violet">AI</span>
          </div>
        </div>
        {showClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-ink"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* New chat */}
      <div className="px-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--color-violet),var(--color-cyan))] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(124,92,255,0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="mt-4 flex-1 overflow-y-auto px-2 pb-4">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Recent
        </p>
        {conversations.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted">
            No conversations yet.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {conversations.map((c) => {
              const active = c.id === activeId;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "group relative mb-1 flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors",
                    active ? "bg-violet/15 ring-1 ring-violet/30" : "hover:bg-white/5",
                  )}
                  onClick={() => onSelect(c.id)}
                >
                  <MessageSquare
                    size={15}
                    className={cn(
                      "mt-0.5 shrink-0",
                      active ? "text-violet" : "text-muted",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {c.title || "New Chat"}
                    </p>
                    {c.preview && (
                      <p className="truncate text-xs text-muted">{c.preview}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.id);
                    }}
                    className="shrink-0 rounded-md p-1 text-muted opacity-0 transition-opacity hover:bg-red-500/15 hover:text-red-300 group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="border-t border-hairline px-4 py-3 text-[11px] text-muted">
        Powered by Bhavyam AI · Subham Mahapatra
      </div>
    </div>
  );
}
