"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2, Search } from "lucide-react";
import { getConversations, deleteConversation, type ConversationSummary } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const handleOpen = (id: string) => router.push(`/?id=${id}`);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="glass-panel h-full flex flex-col p-6 overflow-hidden min-h-0">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="font-display text-xl font-bold text-white">History Log</h1>
        <span className="text-xs text-slate-500">{conversations.length} total</span>
      </div>

      <div className="relative mb-4 shrink-0">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full bg-blue-950/30 border border-accent-blue/20 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-blue/50"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
        {loading && <p className="text-sm text-slate-500">Loading history…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-500">No conversations found.</p>
        )}

        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => handleOpen(c.id)}
            className="group flex items-start gap-3 rounded-xl border border-accent-blue/15 bg-blue-950/20 p-3.5 cursor-pointer hover:border-accent-blue/40 transition-colors"
          >
            <MessageSquare size={16} className="text-accent-blue mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{c.title}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{c.preview}</p>
              <p className="text-[10px] text-slate-600 mt-1">
                {new Date(c.updated_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(e, c.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
