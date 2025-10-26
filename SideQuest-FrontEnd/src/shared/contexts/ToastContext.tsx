import React, { createContext, useState } from 'react';
import type { Toast } from '../types/toast';

interface ToastContextType {
  toasts: Toast[];
  show: (toast: Toast) => void;
  remove: (index: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (toast: Toast) => setToasts(prev => [...prev, toast]);
  const remove = (index: number) => setToasts(prev => prev.filter((_, i) => i !== index));

  return (
    <ToastContext.Provider value={{ toasts, show, remove }}>
      {children}
    </ToastContext.Provider>
  );
};

export { ToastContext };