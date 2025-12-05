'use client';

import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]
            animate-in slide-in-from-top-5 fade-in
            ${toast.variant === 'destructive' ? 'bg-red-600 text-white' : ''}
            ${toast.variant === 'success' ? 'bg-green-600 text-white' : ''}
            ${toast.variant === 'default' ? 'bg-canvas-surface dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {toast.title && (
                <div className="font-semibold mb-1">{toast.title}</div>
              )}
              {toast.description && (
                <div className="text-sm opacity-90">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-sm opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
