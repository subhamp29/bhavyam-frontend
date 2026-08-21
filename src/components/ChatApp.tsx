"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, LayoutDashboard, Menu, Plus, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  API_BASE,
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  getModels,
  streamChat,
  type ConversationSummary,
  type ModelInfo,
} from "@/lib/api";
import Sidebar from "./Sidebar";
import ModelSelector from "./ModelSelector";
import MessageBubble, { type ChatMessage } from "./MessageBubble";

export default function ChatApp() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await getConversations());
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Initial load: models + conversations + persisted model choice.
  useEffect(() => {
    (async () => {
      try {
        const m = await getModels();
        setModels(m);
        const saved =
          typeof window !== "undefined"
            ? localStorage.getItem("bhavyam.model")
            : null;
        if (saved && m.find((x) => x.id === saved)) setSelectedModelId(saved);
        else if (m[0]) setSelectedModelId(m[0].id);
        await refreshConversations();
      } catch {
        setError(
          `Could not reach the Bhavyam AI backend at ${API_BASE}. Start it with: uvicorn api.main:app --reload`,
        );
      }
    })();
  }, [refreshConversations]);

  useEffect(() => {
    if (typeof window !== "undefined" && selectedModelId) {
      localStorage.setItem("bhavyam.model", selectedModelId);
    }
  }, [selectedModelId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    setError(null);
    try {
      const conv = await getConversation(id);
      setMessages(
        conv.messages.map((m) => ({
          role: m.role as ChatMessage["role"],
          content: m.content,
        })),
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  const newChat = useCallback(async () => {
    setError(null);
    setMessages([]);
    setActiveId(null);
    setSidebarOpen(false);
    try {
      const { id } = await createConversation();
      setActiveId(id);
      await refreshConversations();
    } catch (e) {
      console.error(e);
    }
  }, [refreshConversations]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        if (activeId === id) {
          setActiveId(null);
          setMessages([]);
        }
        await refreshConversations();
      } catch (e) {
        console.error(e);
      }
    },
    [activeId, refreshConversations],
  );

  const handleExport = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/conversations/${id}/export`);
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chat_history.txt";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || !selectedModelId) return;
    setInput("");
    setError(null);
    const convId = activeId ?? "";
    setIsStreaming(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", streaming: true },
    ]);

    let acc = "";
    let finalConvId = convId;
    try {
      for await (const ev of streamChat({
        conversation_id: convId,
        message: text,
        model_id: selectedModelId,
      })) {
        if (ev.delta) {
          acc += ev.delta;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              content: acc,
              streaming: true,
            };
            return copy;
          });
        }
        if (ev.conversation_id) finalConvId = ev.conversation_id;
        if (ev.done) {
          setActiveId(finalConvId);
          await refreshConversations();
          try {
            const conv = await getConversation(finalConvId);
            setMessages(
              conv.messages.map((m) =>
                m.role === "assistant" && m.content === ""
                  ? { role: "assistant", content: acc }
                  : { role: m.role as ChatMessage["role"], content: m.content },
              ),
            );
          } catch {
            /* keep locally accumulated text */
          }
        }
        if (ev.error) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              content: ev.error ?? "Something went wrong.",
              streaming: false,
              error: true,
            };
            return copy;
          });
        }
      }
    } catch (err) {
      console.error("BHAVYAM CHAT ERROR:", err);

      const message =
        err instanceof Error ? err.message : String(err);

      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: message,
          streaming: false,
          error: true,
        };
        return copy;
      });
    } finally {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, streaming: false } : m,
        ),
      );
    }
  }, [input, isStreaming, selectedModelId, activeId, refreshConversations]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-glow relative flex h-screen w-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNewChat={newChat}
          onDelete={handleDelete}
        />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <Sidebar
                conversations={conversations}
                activeId={activeId}
                onSelect={selectConversation}
                onNewChat={newChat}
                onDelete={handleDelete}
                onClose={() => setSidebarOpen(false)}
                showClose
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main panel */}
      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-hairline px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-ink md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="font-display text-lg font-semibold tracking-tight">
            Bhavyam <span className="text-violet">AI</span>
          </div>

          <ModelSelector
            models={models}
            value={selectedModelId}
            onChange={setSelectedModelId}
          />

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={newChat}
              className="flex items-center gap-1.5 rounded-full border border-hairline bg-panel px-3 py-1.5 text-sm text-ink/90 transition-colors hover:border-violet/50 hover:text-ink"
            >
              <Plus size={14} /> New
            </button>
            {activeId && (
              <button
                onClick={() => handleExport(activeId)}
                className="flex items-center gap-1.5 rounded-full border border-hairline bg-panel px-3 py-1.5 text-sm text-ink/90 transition-colors hover:border-violet/50 hover:text-ink"
                title="Export conversation"
              >
                <Download size={14} /> Export
              </button>
            )}
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-full border border-hairline bg-panel px-3 py-1.5 text-sm text-ink/90 transition-colors hover:border-cyan/50 hover:text-ink"
            >
              <LayoutDashboard size={14} /> Stats
            </a>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <EmptyState modelName={models.find((m) => m.id === selectedModelId)?.display_name} />
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.map((m, i) => (
                <MessageBubble key={i} msg={m} />
              ))}
            </div>
          )}
          {error && (
            <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-hairline px-4 py-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <div className="flex flex-1 items-end rounded-2xl border border-hairline bg-panel px-4 py-2.5 transition-colors focus-within:border-violet/60 focus-within:shadow-[0_0_0_3px_rgba(124,92,255,0.12)]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                rows={1}
                placeholder="Message Bhavyam AI…"
                className="max-h-40 flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all",
                isStreaming || !input.trim()
                  ? "cursor-not-allowed bg-panel-2 text-muted"
                  : "bg-[linear-gradient(135deg,var(--color-violet),var(--color-cyan))] shadow-[0_10px_30px_-10px_rgba(124,92,255,0.7)] hover:scale-105 active:scale-95",
              )}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted">
            Bhavyam AI can make mistakes. Responses are cleaned for safety.
          </p>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ modelName }: { modelName?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-violet),var(--color-cyan))] text-white shadow-[0_16px_40px_-12px_rgba(124,92,255,0.7)]"
      >
        <SparklesBig />
      </motion.div>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
        How can I help you today?
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {modelName
          ? `Chatting with ${modelName}. Ask anything to get started.`
          : "Start a conversation — your messages are saved automatically."}
      </p>
    </div>
  );
}

function SparklesBig() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}
