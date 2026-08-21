"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { getTrending } from "@/lib/api";

type Topic = { label: string; count: number };

export default function TrendingPanel() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrending()
      .then((data) => setTopics(data.topics))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="font-display text-xs font-bold tracking-widest text-accent-purple">
          TRENDING TOPICS
        </h2>
        <TrendingUp size={16} className="text-accent-blue" />
      </div>

      <div className="space-y-2">
        {loading && <p className="text-sm text-slate-500">Loading trends…</p>}

        {!loading && topics.length === 0 && (
          <p className="text-sm text-slate-500">
            Not enough data yet — trends will appear as you chat.
          </p>
        )}

        {topics.map((topic, i) => (
          <div
            key={topic.label}
            className="rounded-xl border border-accent-blue/20 bg-blue-950/20 p-3 hover:border-accent-blue/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white truncate pr-2">
                {i + 1}. {topic.label}
              </span>
              <span className="text-xs text-accent-blue shrink-0">{topic.count}×</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
