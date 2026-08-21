"use client";

type ThinkingIndicatorProps = {
  visible: boolean;
};

export default function ThinkingIndicator({ visible }: ThinkingIndicatorProps) {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 text-accent-blue font-mono text-xs">
      <div
        className="relative w-10 h-10"
        style={{ animation: "morph-sphere 3s ease-in-out infinite" }}
      >
        <div
          className="absolute inset-0 rounded-full opacity-80"
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.6), rgba(168,85,247,0.6))",
            animation: "morph-sphere 3s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-1 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.8), rgba(168,85,247,0.4))",
            animation: "morph-sphere 3s ease-in-out infinite reverse",
          }}
        />
        {/* Orbit ring */}
        <div
          className="absolute inset-[-4px] rounded-full border border-accent-blue/30"
          style={{ animation: "spin 2s linear infinite" }}
        />
      </div>
      <span className="tracking-wider">COMPUTING TENSOR VECTOR MATRIX...</span>
    </div>
  );
}
