"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getSupabaseConversations,
  createSupabaseConversation,
  deleteSupabaseConversation,
  saveSupabaseMessage,
  updateSupabaseConversationTitle,
} from "@/lib/supabaseData";
import { getConversation } from "@/lib/api";

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

  const refresh = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectConversation = useCallback(async (id: string) => {
    try {
      return await getConversation(id);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      throw error;
    }
  }, []);

  const createConversation = useCallback(async () => {
    if (!user) throw new Error("Not authenticated");
    const { id } = await createSupabaseConversation(user.id);
    return id;
  }, [user]);

  const deleteConversation = useCallback(async (id: string) => {
    if (!user) return;
    await deleteSupabaseConversation(user.id, id);
    await refresh();
  }, [user, refresh]);

  const saveMessage = useCallback(async (
    conversationId: string,
    role: "user" | "assistant" | "system",
    content: string,
    model: string,
    backend: string,
  ) => {
    if (!user) throw new Error("Not authenticated: cannot save message");
    await saveSupabaseMessage(user.id, conversationId, role, content, model, backend);
  }, [user]);

  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    if (!user) return;
    await updateSupabaseConversationTitle(user.id, conversationId, title);
  }, [user]);

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
