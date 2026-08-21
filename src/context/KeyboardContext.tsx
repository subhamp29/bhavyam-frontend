"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type KeyboardContextType = {
  inputFocused: boolean;
  setInputFocused: (value: boolean) => void;
};

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [inputFocused, setInputFocused] = useState(false);
  return (
    <KeyboardContext.Provider value={{ inputFocused, setInputFocused }}>
      {children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard() {
  const ctx = useContext(KeyboardContext);
  if (!ctx) {
    throw new Error("useKeyboard must be used within a KeyboardProvider");
  }
  return ctx;
}
