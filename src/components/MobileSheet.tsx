"use client";

import { useRef, useState } from "react";

type MobileSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export default function MobileSheet({ open, onOpenChange, children }: MobileSheetProps) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  };

  const onTouchEnd = () => {
    dragging.current = false;
    if (dragY > 80) onOpenChange(false);
    setDragY(0);
    startY.current = null;
  };

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => onOpenChange(false)}
        />
      )}
      <div
        className="lg:hidden fixed left-0 right-0 bottom-0 z-50 rounded-t-2xl border-t border-accent-blue/20 bg-blue-950/95 backdrop-blur-md max-h-[70vh] overflow-hidden transition-transform duration-300 ease-out"
        style={{
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
        }}
      >
        <div
          className="flex justify-center py-2 touch-none"
          onClick={() => onOpenChange(!open)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="h-1 w-10 rounded-full bg-slate-600" />
        </div>
        <div className="overflow-y-auto custom-scrollbar px-4 pb-[calc(env(safe-area-inset-bottom)+72px)] max-h-[calc(70vh-24px)]">
          {children}
        </div>
      </div>
    </>
  );
}
