import { useEffect } from 'react';
import type { Toast } from '../../types/toast';

type Props = {
  toasts: Toast[];
  remove: (index: number) => void;
};

export const ToastContainer = ({ toasts, remove }: Props) => {
  useEffect(() => {
    const timers = toasts.map((_, index) =>
      setTimeout(() => remove(index), 3000)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, remove]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`px-4 py-2 rounded shadow-lg text-white text-sm ${
            toast.tipo === 'erro' ? 'bg-red-600' :
            toast.tipo === 'sucesso' ? 'bg-green-600' :
            'bg-red-600'
          }`}
        >
          {toast.mensagem}
        </div>
      ))}
    </div>
  );
};
