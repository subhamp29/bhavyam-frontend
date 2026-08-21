"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { ChatMessage } from "@/components/MessageBubble";

type ActiveChatContextType = {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const ActiveChatContext = createContext<ActiveChatContextType | undefined>(undefined);

export function ActiveChatProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  return (
    <ActiveChatContext.Provider
      value={{ activeConversationId, setActiveConversationId, messages, setMessages }}
    >
      {children}
    </ActiveChatContext.Provider>
  );
}

export function useActiveChat() {
  const ctx = useContext(ActiveChatContext);
  if (!ctx) throw new Error("useActiveChat must be used within ActiveChatProvider");
  return ctx;
}
