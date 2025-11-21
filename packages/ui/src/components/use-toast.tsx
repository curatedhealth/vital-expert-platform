'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface ToastContextValue {
  toast: (toast: Toast) => void;
  toasts: Toast[];
  dismiss: (toastId: string) => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((toastId: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId)
    );
  }, []);

  const toast = useCallback((newToast: Toast) => {
    const id = newToast.id || Math.random().toString(36).substring(7);
    const toastWithId = { ...newToast, id };

    setToasts((currentToasts) => [...currentToasts, toastWithId]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }, [dismiss]);

  return {
    toast,
    toasts,
    dismiss,
  };
}
