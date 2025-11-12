import { useState, useEffect, useCallback } from "react";

export interface FormData {
  name: string;
  description: string;
  responsible: string[];
  endDate: string;
  status: "Pendente" | "Desenvolvimento" | "Concluído";
  comment: string;
}

interface UseModalTarefaProps {
  initialData?: Partial<FormData> & { id?: string };
  isOpen: boolean;
  onClose: () => void;
}

export function useModalTarefa({ initialData, isOpen, onClose }: UseModalTarefaProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    responsible: [],
    endDate: "",
    status: "Pendente",
    comment: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mostrarListaResponsaveis, setMostrarListaResponsaveis] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? "",
        description: initialData.description ?? "",
        responsible: initialData.responsible ?? [],
        endDate: initialData.endDate ?? "",
        status: initialData.status ?? "Pendente",
        comment: initialData.comment ?? "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        responsible: [],
        endDate: "",
        status: "Pendente",
        comment: "",
      });
    }
    setShowDeleteConfirm(false);
  }, [initialData, isOpen]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string | string[] | FormData["status"]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleResponsavel = useCallback((id: string) => {
    setFormData(prev => {
      const exists = prev.responsible.includes(id);
      return {
        ...prev,
        responsible: exists
          ? prev.responsible.filter(x => x !== id)
          : [...prev.responsible, id],
      };
    });
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const handleClose = useCallback(() => {
    setToastMsg(null);
    onClose();
  }, [onClose]);

  return {
    formData,
    showDeleteConfirm,
    mostrarListaResponsaveis,
    toastMsg,

    handleInputChange,
    toggleResponsavel,
    showToast,
    handleClose,
    setShowDeleteConfirm,
    setMostrarListaResponsaveis,
  };
}