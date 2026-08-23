"use client";

import { getSupabase } from "@/lib/supabase";

const supabase = getSupabase();

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
};

export type ConversationDetail = {
  id: string;
  title: string;
  created_at: string;
  messages: ChatMessage[];
};

export async function getSupabaseConversations(userId: string): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as any[] || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    preview: "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getSupabaseConversation(userId: string, conversationId: string): Promise<ConversationDetail> {
  const { data: conv, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (convError || !conv) throw new Error("Conversation not found");

  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (msgError) throw msgError;

  return {
    id: (conv as any).id,
    title: (conv as any).title,
    created_at: (conv as any).created_at,
    messages: (messages as any[] || []).map((m: any) => ({
      role: m.role as ChatMessage["role"],
      content: m.content,
    })),
  };
}

export async function createSupabaseConversation(userId: string): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  const { error } = await supabase
    .from("conversations")
    .insert({ id, user_id: userId, title: "New Chat" } as any);

  if (error) throw error;
  return { id };
}

export async function deleteSupabaseConversation(userId: string, conversationId: string): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function saveSupabaseMessage(
  userId: string,
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
  model: string,
  backend: string,
  responseMs?: number,
  tokenCount?: number,
): Promise<void> {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    user_id: userId,
    role,
    content,
    model,
    backend,
    response_ms: responseMs ?? null,
    token_count: tokenCount ?? null,
  } as any);

  if (error) {
    console.error("❌ Supabase insert failed:", error);
    throw error;
  }
}

export async function updateSupabaseConversationTitle(
  userId: string,
  conversationId: string,
  title: string,
): Promise<void> {
  const table = (supabase as any).from("conversations");
  const { error } = await table
    .update({ title })
    .eq("id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
