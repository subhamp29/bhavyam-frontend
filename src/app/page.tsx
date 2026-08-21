"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import Sidebar from "@/components/Sidebar";
import TrendingSidebar from "@/components/TrendingSidebar";
import { useStreaming } from "@/context/StreamingContext";
import { useConversations } from "@/hooks/useConversations";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id");
  const { isStreaming, setIsStreaming } = useStreaming();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const {
    conversations,
    refresh,
    selectConversation,
    createConversation,
    deleteConversation,
    saveMessage,
    updateTitle,
  } = useConversations();

  const handleSelect = (id: string) => {
    setMobileSidebarOpen(false);
    router.push(`/?id=${id}`, { scroll: false });
  };

  const handleNewChat = () => {
    setMobileSidebarOpen(false);
    router.push("/", { scroll: false }); // lazy creation on first send
  };

  const handleDelete = async (id: string) => {
    await deleteConversation(id);
    if (id === activeId) {
      router.push("/", { scroll: false });
    }
  };

  return (
    <div className="flex h-full min-h-0 gap-5">
      {/* Desktop conversation sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNewChat={handleNewChat}
          onDelete={handleDelete}
        />
      </div>

      {/* Mobile conversation drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              onNewChat={handleNewChat}
              onDelete={handleDelete}
              onClose={() => setMobileSidebarOpen(false)}
              showClose
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 h-full min-h-0 flex-1">
        <ChatPanel
          activeId={activeId}
          onSelectConversation={selectConversation}
          onNewChat={createConversation}
          onDeleteConversation={handleDelete}
          onRefreshConversations={refresh}
          isStreaming={isStreaming}
          onStreamingChange={setIsStreaming}
          onSaveMessage={saveMessage}
          onUpdateTitle={updateTitle}
          onLoadConversation={selectConversation}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />
        <TrendingSidebar />
      </div>
    </div>
  );
}
