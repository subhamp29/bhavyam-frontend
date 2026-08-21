"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type StreamingContextType = {
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
};

const StreamingContext = createContext<StreamingContextType | undefined>(undefined);

export function StreamingProvider({ children }: { children: ReactNode }) {
  const [isStreaming, setIsStreaming] = useState(false);
  return (
    <StreamingContext.Provider value={{ isStreaming, setIsStreaming }}>
      {children}
    </StreamingContext.Provider>
  );
}

export function useStreaming() {
  const ctx = useContext(StreamingContext);
  if (!ctx) {
    throw new Error("useStreaming must be used within a StreamingProvider");
  }
  return ctx;
}
