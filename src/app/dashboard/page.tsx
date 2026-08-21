import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";

export const metadata = {
  title: "Dashboard — Bhavyam AI",
};

export default function DashboardPage() {
  return (
    <main className="app-glow relative flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-hairline bg-panel/80 p-10 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-violet),var(--color-cyan))] text-white shadow-[0_14px_36px_-10px_rgba(124,92,255,0.7)]">
          <BarChart3 size={24} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          3D Stats Dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The interactive, real-time analytics view is coming soon. It will
          visualize messages per model, token usage, and response times from
          the FastAPI backend.
        </p>
        <span className="mt-6 inline-block rounded-full border border-violet/40 bg-violet/10 px-4 py-1.5 text-xs font-medium text-violet">
          Coming soon
        </span>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm text-ink/80 transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to chat
        </Link>
      </div>
    </main>
  );
}
