"use client";

import ChatPanel from "@/components/ChatPanel";
import TrendingSidebar from "@/components/TrendingSidebar";
import { useStreaming } from "@/context/StreamingContext";
import { useConversations } from "@/hooks/useConversations";

export default function Page() {
  const { isStreaming, setIsStreaming } = useStreaming();
  const {
    conversations,
    loading,
    refresh,
    selectConversation,
    createConversation,
    deleteConversation,
    saveMessage,
    updateTitle,
  } = useConversations();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 h-full min-h-0">
      <ChatPanel
        conversations={conversations}
        activeId={null}
        onSelectConversation={selectConversation}
        onNewChat={createConversation}
        onDeleteConversation={deleteConversation}
        onRefreshConversations={refresh}
        isStreaming={isStreaming}
        onStreamingChange={setIsStreaming}
        onSaveMessage={saveMessage}
        onUpdateTitle={updateTitle}
      />
      <TrendingSidebar />
    </div>
  );
}
