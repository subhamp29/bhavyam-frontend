// Thin client for the Bhavyam AI FastAPI backend (Phase 1).
// All endpoints are documented in MiniChat/api/README.md.

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(
    /\/$/,
    "",
  );

export interface ModelInfo {
  id: string;
  display_name: string;
  backend: "local" | "remote";
  description: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  created_at: string;
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
}

// SSE event shapes streamed by POST /api/chat.
//  - { delta }      : a chunk of assistant text to append
//  - { done, ... }  : stream finished; conversation persisted (id returned)
//  - { error }      : failure (nothing persisted)
export interface ChatEvent {
  delta?: string;
  done?: boolean;
  error?: string;
  conversation_id?: string;
  model_id?: string;
  response_ms?: number;
  token_count?: number;
}

export interface StatsResponse {
  total_conversations: number;
  total_messages: number;
  db_size_mb: number;
  messages_by_role: Record<string, number>;
  messages_by_model: Record<string, number>;
  messages_per_day: { date: string; messages: number }[];
  tokens: {
    tracked: boolean;
    total_completion_tokens: number | null;
    avg_completion_tokens: number | null;
    by_model: Record<string, { total_completion_tokens: number; avg_completion_tokens: number; messages: number }>;
  };
  avg_response_time_ms: {
    tracked: boolean;
    overall: number | null;
    by_model: Record<string, { avg_response_ms: number; messages: number }>;
  };
}

import { supabase } from "@/lib/supabase";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Supabase session error: ${error.message}`);
  }

  if (!data.session?.access_token) {
    throw new Error("Not authenticated: Supabase session is missing.");
  }

  return {
    Authorization: `Bearer ${data.session.access_token}`,
  };
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = init?.headers ? { ...(init.headers as Record<string, string>) } : {};
  const authHeaders = await getAuthHeaders();
  Object.assign(headers, authHeaders);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      // ignore body read errors
    }
    throw new Error(`Request failed (${res.status}): ${body || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const getModels = () =>
  jsonFetch<ModelInfo[]>(`${API_BASE}/api/models`);

export const getConversations = () =>
  jsonFetch<ConversationSummary[]>(`${API_BASE}/api/conversations`);

export const getConversation = (id: string) =>
  jsonFetch<ConversationDetail>(`${API_BASE}/api/conversations/${id}`);

export const createConversation = () =>
  jsonFetch<{ id: string }>(`${API_BASE}/api/conversations`, {
    method: "POST",
  });

export const deleteConversation = (id: string) =>
  jsonFetch<{ id: string; deleted: boolean }>(
    `${API_BASE}/api/conversations/${id}`,
    { method: "DELETE" },
  );

// Streams chat completions as Server-Sent Events and yields parsed events.
export async function* streamChat(payload: {
  conversation_id: string;
  message: string;
  model_id: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  file?: File | null;
}): AsyncGenerator<ChatEvent> {
  const authHeaders = await getAuthHeaders();

  const formData = new FormData();

  formData.append("conversation_id", payload.conversation_id);
  formData.append("message", payload.message);
  formData.append("model_id", payload.model_id);
  formData.append(
    "temperature",
    String(payload.temperature ?? 0.7)
  );
  formData.append(
    "top_p",
    String(payload.top_p ?? 0.95)
  );
  formData.append(
    "max_tokens",
    String(payload.max_tokens ?? 512)
  );

  if (payload.file) {
    formData.append("file", payload.file, payload.file.name);
  }

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      ...authHeaders,
      Accept: "text/event-stream",
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();

    console.error("❌ Chat API failed:", {
      status: res.status,
      statusText: res.statusText,
      body,
    });

    throw new Error(
      `Chat request failed (${res.status}): ${
        body || res.statusText
      }`
    );
  }

  if (!res.body) {
    throw new Error("Chat response has no body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let sep: number;

    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      const dataLine = frame
        .split("\n")
        .find((line) => line.startsWith("data:"));

      if (!dataLine) continue;

      const payloadStr = dataLine.slice(5).trim();

      if (!payloadStr) continue;

      try {
        yield JSON.parse(payloadStr) as ChatEvent;
      } catch {
        console.warn("Invalid SSE frame:", payloadStr);
      }
    }
  }
}

export const getStats = () =>
  jsonFetch<StatsResponse>(`${API_BASE}/api/stats`);

export interface TrendingResponse {
  topics: { label: string; traffic?: string | null }[];
}

export const getTrending = async (limit = 6) => {
  const res = await fetch(`${API_BASE}/api/trending?limit=${limit}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Trends request failed (${res.status}): ${body || res.statusText}`
    );
  }
  return res.json() as Promise<TrendingResponse>;
};
