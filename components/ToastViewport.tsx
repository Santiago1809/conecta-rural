"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT } from "@/lib/toast";

export default function ToastViewport() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setMessage(customEvent.detail);
      window.setTimeout(() => setMessage(null), 3200);
    };
    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-5 z-[1000] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
      <div role="status" className="toast-enter rounded-[10px] bg-bosque px-4 py-3 text-sm font-semibold text-white shadow-warm">
        {message}
      </div>
    </div>
  );
}
