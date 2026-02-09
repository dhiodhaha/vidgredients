import { useCallback, useState } from 'react';
import type { ToastType } from '../components/ui/Toast';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((message: string, options?: { type?: ToastType; duration?: number }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = {
      id,
      message,
      type: options?.type ?? 'info',
      duration: options?.duration ?? 3000,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      return show(message, { type: 'success', duration });
    },
    [show]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return show(message, { type: 'error', duration });
    },
    [show]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return show(message, { type: 'warning', duration });
    },
    [show]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return show(message, { type: 'info', duration });
    },
    [show]
  );

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    warning,
    info,
  };
}
