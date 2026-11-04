"use client";

import { useSyncExternalStore } from 'react';
import { dismissToast, getToasts, subscribeToasts } from '@/lib/toast';

/**
 * Global toast viewport. Mounted once in the root layout so the editor,
 * its tools, and every form can surface notifications without native alert().
 */
export default function ToastViewport() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,26rem)] flex-col gap-2">
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur ${
            toastItem.kind === 'error'
              ? 'border-red-500/40 bg-red-950/95 text-red-100'
              : 'border-emerald-500/40 bg-emerald-950/95 text-emerald-100'
          }`}
        >
          <span className="flex-1 break-words">{toastItem.message}</span>
          <button
            onClick={() => dismissToast(toastItem.id)}
            aria-label="Dismiss notification"
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
