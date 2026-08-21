"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Paperclip, Send, Trash2, Download, Volume2, VolumeX, ChevronDown, Cpu, Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  API_BASE,
  getConversation,
  getModels,
  streamChat,
  type ConversationSummary,
  type ModelInfo,
} from "@/lib/api";
import MessageBubble, { type ChatMessage } from "./MessageBubble";
import ThinkingIndicator from "./ThinkingIndicator";
import { useKeyboard } from "@/context/KeyboardContext";

type ChatPanelProps = {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => Promise<string>;
  onDeleteConversation: (id: string) => void;
  onRefreshConversations: () => Promise<void>;
  isStreaming: boolean;
  onStreamingChange: (v: boolean) => void;
  onSaveMessage: (conversationId: string, role: "user" | "assistant" | "system", content: string, model: string, backend: string) => Promise<void>;
  onUpdateTitle: (conversationId: string, title: string) => Promise<void>;
};

export default function ChatPanel({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRefreshConversations,
  isStreaming,
  onStreamingChange,
  onSaveMessage,
  onUpdateTitle,
}: ChatPanelProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const { setInputFocused } = useKeyboard();

  // Load models
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
      } catch {
        setError(`Could not reach backend at ${API_BASE}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedModelId && typeof window !== "undefined") {
      localStorage.setItem("bhavyam.model", selectedModelId);
    }
  }, [selectedModelId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Close model selector on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(e.target as Node)) {
        setModelSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    setError(null);
    try {
      const conv = await getConversation(id);
      await onUpdateTitle(id, conv.title);
      const messages = conv.messages.map((m) => ({
        role: m.role as ChatMessage["role"],
        content: m.content,
      }));
      for (const msg of messages) {
        await onSaveMessage(id, msg.role, msg.content, "", "fastapi");
      }
      setMessages(messages);
      onSelectConversation(id);
    } catch {
      setError("Failed to load conversation");
    }
  }, [onSelectConversation, onSaveMessage, onUpdateTitle]);

  const newChat = useCallback(async () => {
    setError(null);
    setMessages([]);
    try {
      const id = await onNewChat();
      onSelectConversation(id);
    } catch {
      setError("Failed to create conversation");
    }
  }, [onSelectConversation, onNewChat]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await onDeleteConversation(id);
        if (activeId === id) {
          setMessages([]);
        }
        await onRefreshConversations();
      } catch {
        setError("Failed to delete conversation");
      }
    },
    [activeId, onDeleteConversation, onRefreshConversations],
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || !selectedModelId) return;
    setInput("");
    setError(null);
    setTokenCount(null);
    const convId = activeId ?? "";
    onStreamingChange(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", streaming: true },
    ]);

    // Persist user message to Supabase if available
    if (onSaveMessage && convId) {
      try {
        await onSaveMessage(convId, "user", text, selectedModelId, "fastapi");
      } catch {
        // ignore persistence errors
      }
    }

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
          onSelectConversation(finalConvId);
          await onRefreshConversations();

          // Persist assistant message to Supabase if available
          if (onSaveMessage && finalConvId) {
            try {
              await onSaveMessage(finalConvId, "assistant", acc, selectedModelId, "fastapi");
            } catch {
              // ignore
            }
          }

          // Auto-title new conversations from first user message
          if (onUpdateTitle && messages.length === 0 && finalConvId) {
            try {
              const title = text.slice(0, 40) + (text.length > 40 ? "..." : "");
              await onUpdateTitle(finalConvId, title);
              await onRefreshConversations();
            } catch {
              // ignore
            }
          }

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
            // keep locally accumulated text
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
      onStreamingChange(false);
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, streaming: false } : m,
        ),
      );
    }
  }, [input, isStreaming, selectedModelId, activeId, onStreamingChange, onSelectConversation, onRefreshConversations, onSaveMessage, onUpdateTitle, messages.length]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const selectedModel = models.find((m) => m.id === selectedModelId);

  return (
    <main className="glass-panel flex flex-col h-full overflow-hidden min-h-0 pb-0 lg:pb-0">
      {/* Chat Header */}
      <header className="px-4 py-3 lg:px-7 lg:py-4 border-b border-accent-blue/20 flex items-center justify-between bg-blue-950/20 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center border border-accent-blue/30 text-accent-blue">
            <span className="text-base lg:text-lg">✨</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base lg:text-lg text-white tracking-tight">
                Neural Link Active
              </h3>
              {/* Model selector dropdown */}
              <div className="relative" ref={modelSelectorRef}>
                <button
                  type="button"
                  onClick={() => setModelSelectorOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-lg border border-accent-purple/30 bg-accent-purple/10 px-2 py-0.5 lg:px-2.5 lg:py-1 text-[9px] lg:text-[10px] font-mono font-bold uppercase text-blue-300 hover:border-accent-blue/50 hover:bg-accent-blue/15 transition-all truncate max-w-[120px] lg:max-w-none"
                >
                  {selectedModel?.display_name ?? "Select model"}
                  <ChevronDown size={10} className="lg:size-3 text-blue-300 shrink-0" />
                </button>
                {modelSelectorOpen && (
                  <div className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-hairline bg-panel-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
                    {models.map((m) => {
                      const active = m.id === selectedModelId;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedModelId(m.id);
                            setModelSelectorOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                            active ? "bg-accent-purple/15" : "hover:bg-white/5",
                          )}
                        >
                          <div className="mt-0.5">
                            {m.backend === "local" ? (
                              <Cpu size={15} className="text-cyan" />
                            ) : (
                              <Globe size={15} className="text-accent-purple" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-medium text-ink">
                                {m.display_name}
                              </span>
                              {active && <span className="text-[10px] font-bold text-accent-purple">ACTIVE</span>}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">
                              {m.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            {/* Subtitle: desktop-only, decorative flavor text */}
            <p className="hidden lg:block text-sm text-slate-400 mt-0.5">
              High-throughput quantum vector matrix operational
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            title="Toggle sound"
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={() => {
              const transcript = messages
                .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
                .join("\n\n");
              const blob = new Blob([transcript], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Bhavyam_Transcript_${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            title="Export conversation"
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => setMessages([])}
            title="Clear canvas"
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 text-slate-300 hover:text-accent-red transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 lg:px-7 min-h-0 custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-violet),var(--color-cyan))] text-white shadow-[0_16px_40px_-12px_rgba(124,92,255,0.7)]">
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">
              How can I help you today?
            </h1>
            <p className="mt-2 max-w-sm text-sm text-muted">
              {selectedModel
                ? `Chatting with ${selectedModel.display_name}. Ask anything to get started.`
                : "Start a conversation — your messages are saved automatically."}
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <ThinkingIndicator visible={true} />
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-accent-red/40 bg-accent-red/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Preset Chips — desktop-only to save mobile vertical space */}
      <div className="hidden lg:flex px-7 py-2 border-t border-accent-blue/10 items-center gap-2 overflow-x-auto bg-slate-950/40 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
          Presets:
        </span>
        {[
          "Analyze Data",
          "Generate Logic",
          "Refactor Code",
          "Debug System",
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className="prompt-chip"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="input-wrapper shrink-0">
        <div className="relative flex items-center gap-3">
          <button
            title="Attach file (coming soon)"
            disabled
            className="text-slate-500 p-2 rounded-lg cursor-not-allowed opacity-50"
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKeyDown}
            onFocus={() => {
              setInputFocused(true);
              setTimeout(() => {
                inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 300);
            }}
            onBlur={() => setInputFocused(false)}
            placeholder="Type your neural prompt instruction..."
            className="input-field font-sans"
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className={cn(
              "p-3 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shrink-0",
              isStreaming || !input.trim()
                ? "cursor-not-allowed bg-panel-2 text-muted"
                : "bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-accent-blue/30 hover:from-accent-blue hover:to-accent-purple",
            )}
          >
            <Send size={18} />
          </button>
        </div>
        {tokenCount !== null && (
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted">
            {tokenCount} tokens
          </p>
        )}
      </div>
    </main>
  );
}
