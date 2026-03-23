'use client';

import { useState, useEffect } from 'react';
import NotificationToast, { Toast } from './NotificationToast';

let toastId = 0;
let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function showToast(toast: Omit<Toast, 'id'>) {
  if (addToastFn) {
    addToastFn(toast);
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (toast) => {
      const id = `toast-${++toastId}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
    };

    return () => {
      addToastFn = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {toasts.map((toast) => (
          <NotificationToast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
}
