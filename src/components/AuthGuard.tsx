"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function isPublicRoute(path: string | null) {
  if (!path) return false;
  const cleanPath = path.replace(/\/$/, "") || "/";
  return cleanPath === "/login" || cleanPath === "/auth/callback";
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = isPublicRoute(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push("/login");
    }
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-dark">
        <div className="text-accent-blue text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user && !isPublic) {
    return null; // redirecting
  }

  return <>{children}</>;
}

