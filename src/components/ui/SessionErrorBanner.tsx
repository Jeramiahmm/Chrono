"use client";

import { useSession, signOut } from "next-auth/react";

export default function SessionErrorBanner() {
  const { data: session } = useSession();
  const error = (session as unknown as Record<string, unknown>)?.error;

  if (error !== "RefreshAccessTokenError") return null;

  return (
    <div className="fixed top-16 sm:top-20 left-0 right-0 z-50 px-4">
      <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-xs sm:text-sm font-body font-light text-red-400">
          Your Google connection has expired. Please sign in again to restore access.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-1.5 text-xs font-body font-light text-red-400 border border-red-400/30 hover:border-red-400/60 rounded-full transition-all whitespace-nowrap"
        >
          Sign in again
        </button>
      </div>
    </div>
  );
}
