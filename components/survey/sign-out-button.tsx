"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  async function handleSignOut() {
    await authClient.signOut();
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
    >
      تسجيل الخروج
    </button>
  );
}
