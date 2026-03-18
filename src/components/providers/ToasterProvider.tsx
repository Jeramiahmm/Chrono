"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        className: "font-body text-sm",
        style: {
          background: "var(--card-bg)",
          border: "1px solid var(--line-strong)",
          color: "var(--foreground)",
        },
      }}
    />
  );
}
