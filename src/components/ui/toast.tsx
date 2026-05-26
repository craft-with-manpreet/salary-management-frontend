import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

let toastListeners: Array<(toast: Toast) => void> = [];

function addToastListener(listener: (toast: Toast) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
}

function emitToast(toast: Toast) {
  toastListeners.forEach((listener) => listener(toast));
}

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  emitToast({ id: crypto.randomUUID(), message, type });
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return addToastListener((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="alert"
      className={cn(
        'rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all animate-in slide-in-from-bottom-2',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      )}
    >
      {toast.message}
    </div>
  );
}
