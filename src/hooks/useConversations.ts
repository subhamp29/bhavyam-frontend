"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getSupabaseConversations,
  getSupabaseConversation,
  createSupabaseConversation,
  deleteSupabaseConversation,
  saveSupabaseMessage,
  updateSupabaseConversationTitle,
} from "@/lib/supabaseData";

type ConversationSummary = {
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
  messages: { role: "user" | "assistant" | "system"; content: string }[];
};

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getSupabaseConversations(user.id);
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const selectConversation = async (id: string) => {
    if (!user) return null;
    try {
      return await getSupabaseConversation(user.id, id);
    } catch {
      return null;
    }
  };

  const createConversation = async () => {
    if (!user) throw new Error("Not authenticated");
    const { id } = await createSupabaseConversation(user.id);
    return id;
  };

  const deleteConversation = async (id: string) => {
    if (!user) return;
    await deleteSupabaseConversation(user.id, id);
    await refresh();
  };

  const saveMessage = async (
    conversationId: string,
    role: "user" | "assistant" | "system",
    content: string,
    model: string,
    backend: string,
  ) => {
    if (!user) throw new Error("Not authenticated: cannot save message");
    await saveSupabaseMessage(user.id, conversationId, role, content, model, backend);
  };

  const updateTitle = async (conversationId: string, title: string) => {
    if (!user) return;
    await updateSupabaseConversationTitle(user.id, conversationId, title);
  };

  return {
    conversations,
    loading,
    refresh,
    selectConversation,
    createConversation,
    deleteConversation,
    saveMessage,
    updateTitle,
  };
}
