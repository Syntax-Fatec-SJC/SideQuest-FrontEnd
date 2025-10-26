import { useState } from 'react';
import type { Toast } from '../types/toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (toast: Toast) => setToasts(prev => [...prev, toast]);
  const remove = (index: number) => setToasts(prev => prev.filter((_, i) => i !== index));

  return { toasts, show, remove };
};
