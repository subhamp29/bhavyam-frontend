"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const supabase = getSupabase();

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      try {
        timeoutId = setTimeout(() => {
          console.warn("Auth callback getSession timed out after 3s");
        }, 3000);

        await supabase.auth.getSession();
      } catch (error) {
        console.error("Auth callback session error:", error);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        router.push("/");
      }
    })();
  }, [router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-dark">
      <div className="text-accent-blue text-sm animate-pulse">Completing sign in...</div>
    </div>
  );
}
