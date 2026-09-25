"use client";

// Client-side session state. The repo has no SessionProvider by design, so the
// only "am I signed in?" signal is this fetch, shared by every consumer.

import { useEffect, useState } from "react";

export type SessionUser = { name?: string | null; email?: string | null };

export function useSessionUser(): { user: SessionUser | null; loaded: boolean } {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json() as Promise<{ user?: SessionUser }>)
      .then((session) => {
        if (!active) return;
        setUser(session.user ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loaded };
}
