"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const supabase = getSupabase();

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await supabase.auth.getSession();
      router.push("/");
    })();
  }, [router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-dark">
      <div className="text-accent-blue text-sm animate-pulse">Completing sign in...</div>
    </div>
  );
}
