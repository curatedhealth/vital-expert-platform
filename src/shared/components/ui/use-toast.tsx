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

    setToasts((currentToasts) => [...currentToasts, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }, []);

    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId)
    );
  }, []);

  return {
    toast,
    toasts,
    dismiss,
  };
}