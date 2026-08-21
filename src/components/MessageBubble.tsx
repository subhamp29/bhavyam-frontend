"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  error?: boolean;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-violet"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end"
      >
        <div className="flex max-w-[85%] items-start gap-2.5">
          <div className="rounded-2xl rounded-tr-sm border border-violet/40 bg-[linear-gradient(135deg,rgba(124,92,255,0.22),rgba(34,211,238,0.12))] px-4 py-2.5 text-[15px] leading-relaxed text-ink shadow-[0_8px_30px_-12px_rgba(124,92,255,0.45)]">
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel-2 text-muted ring-1 ring-hairline">
            <User size={15} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start"
    >
      <div className="flex max-w-[88%] items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-violet),var(--color-cyan))] text-white shadow-[0_6px_20px_-6px_rgba(124,92,255,0.6)]">
          <Sparkles size={15} />
        </div>
        <div
          className={cn(
            "rounded-2xl rounded-tl-sm border bg-panel-2 px-4 py-2.5 text-[15px] leading-relaxed text-ink",
            msg.error ? "border-red-500/40 text-red-300" : "border-hairline",
          )}
        >
          {msg.streaming && !msg.content ? (
            <TypingDots />
          ) : (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
