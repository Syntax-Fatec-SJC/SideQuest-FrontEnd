import { useState, useEffect, useCallback } from "react";
import { anexoService } from "../../../services/AnexoService";

export interface FormData {
  name: string;
  description: string;
  responsible: string[];
  endDate: string;
  status: "Pendente" | "Desenvolvimento" | "Concluído";
  comment: string;
}

export interface AnexoLocal {
  id?: string;
  file?: File;
  nome: string;
  tipo: "image" | "pdf" | "video";
  tamanho: string;
  dataUpload?: string;
  isNew: boolean;
  isSaved: boolean;
}

interface UseModalTarefaProps {
  initialData?: Partial<FormData> & { id?: string };
  isOpen: boolean;
  onClose: () => void;
}

const TIPOS_PERMITIDOS = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "video/mp4",
];

const MAX_FILE_SIZE = 200 * 1024 * 1024;

function determinarTipo(contentType: string | undefined): "image" | "pdf" | "video" {
  if (!contentType) return "image";
  if (contentType.startsWith("image/")) return "image";
  if (contentType === "application/pdf") return "pdf";
  if (contentType.startsWith("video/")) return "video";
  return "image";
}

function formatarTamanho(bytes: number): string {
  if (bytes === 0) return "0 B";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
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
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const [anexos, setAnexos] = useState<AnexoLocal[]>([]);
  const [anexosParaUpload, setAnexosParaUpload] = useState<File[]>([]);
  const [anexosParaDeletar, setAnexosParaDeletar] = useState<string[]>([]);
  const [loadingAnexos, setLoadingAnexos] = useState(false);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // ===========================================
  // RESETAR FORMULARIO QUANDO MODAL ABRE
  // ===========================================
  useEffect(() => {
    if (isOpen) {
      console.log("===========================================");
      console.log("[useModalTarefa] MODAL ABERTO");
      console.log("initialData:", initialData);
      console.log("===========================================");

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
      setAnexosParaDeletar([]);
    }
  }, [initialData, isOpen]);

  // ===========================================
  // CARREGAR ANEXOS DO BANCO AO ABRIR CARD
  // ===========================================
  useEffect(() => {
    let isMounted = true;

    const carregarAnexos = async () => {
      if (!isOpen) return;

      // Se tem ID = clicou no card = carregar do banco
      if (initialData?.id) {
        console.log("===========================================");
        console.log("[useModalTarefa] CARREGANDO ANEXOS");
        console.log("TarefaId:", initialData.id);
        console.log("===========================================");

        setLoadingAnexos(true);

        try {
          // ✅ CORRIGIDO: listarAnexos retorna ARRAY DIRETO
          const response = await anexoService.listarAnexos(initialData.id);

          // Verificar se o componente ainda está montado
          if (!isMounted) {
            console.log("[useModalTarefa] Componente desmontado, ignorando");
            return;
          }

          console.log("[useModalTarefa] Resposta:", response);


          const lista = Array.isArray(response) ? response : [];

          // Mapear anexos - SEM badge "Novo"
          const anexosCarregados: AnexoLocal[] = lista.map((a: any) => ({
            id: a.id,
            nome: a.nome,
            tipo: determinarTipo(a.contentType || a.tipo) as "image" | "pdf" | "video",
            tamanho: a.tamanho || formatarTamanho(a.size || 0),
            dataUpload: a.dataUpload,
            isNew: false,    // SEM badge "Novo"
            isSaved: true,   // Ja esta no banco
          }));

          console.log("[useModalTarefa] Anexos mapeados:", anexosCarregados.length);
          anexosCarregados.forEach(a => console.log("  ->", a.nome, "ID:", a.id));

          setAnexos(anexosCarregados);
          console.log("[useModalTarefa]  SUCESSO!");

        } catch (error: any) {
          console.error("[useModalTarefa]  ERRO:", error.message);
          // Em caso de erro, não travar - apenas mostrar lista vazia
          if (isMounted) {
            setAnexos([]);
          }
        } finally {
          if (isMounted) {
            setLoadingAnexos(false);
          }
        }
      } else {
        // Modal de criacao
        console.log("[useModalTarefa] Modal de criacao - sem anexos");
        setAnexos([]);
        setAnexosParaUpload([]);
      }
    };

    carregarAnexos();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isOpen, initialData?.id]);

  // ===========================================
  // LIMPAR AO FECHAR
  // ===========================================
  useEffect(() => {
    if (!isOpen) {
      setAnexos([]);
      setAnexosParaUpload([]);
      setAnexosParaDeletar([]);
      setLoadingAnexos(false);
    }
  }, [isOpen]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string | string[] | FormData["status"]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleResponsavel = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      responsible: prev.responsible.includes(id)
        ? prev.responsible.filter((x) => x !== id)
        : [...prev.responsible, id],
    }));
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" = "error") => {
    setToastMsg(message);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const handleClose = useCallback(() => {
    setToastMsg(null);
    onClose();
  }, [onClose]);

  const validarArquivo = useCallback((file: File): string | null => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return `Tipo nao suportado: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Muito grande: ${formatarTamanho(file.size)}`;
    }
    return null;
  }, []);

  const adicionarAnexos = useCallback((files: FileList | File[]) => {
    const novosAnexos: AnexoLocal[] = [];
    const novosArquivos: File[] = [];
    const erros: string[] = [];

    Array.from(files).forEach((file) => {
      const erro = validarArquivo(file);
      if (erro) {
        erros.push(`${file.name}: ${erro}`);
        return;
      }

      const jaExiste =
        anexos.some((a) => a.nome === file.name) ||
        anexosParaUpload.some((f) => f.name === file.name);

      if (jaExiste) {
        erros.push(`${file.name}: Ja adicionado`);
        return;
      }

      novosArquivos.push(file);
      novosAnexos.push({
        file,
        nome: file.name,
        tipo: determinarTipo(file.type),
        tamanho: formatarTamanho(file.size),
        isNew: true,     // COM badge "Novo"
        isSaved: false,  // Ainda nao esta no banco
      });
    });

    if (erros.length > 0) {
      showToast(erros[0], "error");
    }

    if (novosAnexos.length > 0) {
      setAnexos((prev) => [...prev, ...novosAnexos]);
      setAnexosParaUpload((prev) => [...prev, ...novosArquivos]);
      if (erros.length === 0) {
        showToast(`${novosAnexos.length} arquivo(s) adicionado(s)`, "success");
      }
    }
  }, [anexos, anexosParaUpload, validarArquivo, showToast]);

  const removerAnexo = useCallback((index: number) => {
    const anexo = anexos[index];

    if (anexo.isSaved && anexo.id) {
      setAnexosParaDeletar((prev) => [...prev, anexo.id!]);
    } else if (anexo.file) {
      setAnexosParaUpload((prev) => prev.filter((f) => f.name !== anexo.nome));
    }

    setAnexos((prev) => prev.filter((_, i) => i !== index));
    showToast("Anexo removido", "success");
  }, [anexos, showToast]);

  // ===========================================
  // UPLOAD DE ANEXOS
  // ===========================================
  const uploadAnexosPendentes = useCallback(async (tarefaId: string) => {
    if (anexosParaUpload.length === 0) {
      console.log("[useModalTarefa] Nenhum anexo pendente");
      return { sucesso: true, total: 0, enviados: 0, arquivos: [] };
    }

    console.log("===========================================");
    console.log("[useModalTarefa] UPLOAD", anexosParaUpload.length, "arquivo(s)");
    console.log("TarefaId:", tarefaId);
    console.log("===========================================");

    setUploadingAnexos(true);

    try {
      const response = await anexoService.uploadAnexos(tarefaId, anexosParaUpload);

      console.log("[useModalTarefa] Upload concluido:", response);


      const arquivosRetornados = Array.isArray(response.arquivos)
        ? response.arquivos
        : Array.isArray(response)
          ? response
          : [];

      // Limpar fila
      setAnexosParaUpload([]);

      // Atualizar estado - remover badge "Novo"
      setAnexos((prev) =>
        prev.map((a) => {
          if (!a.isSaved && a.file) {
            // Encontrar o ID retornado
            const arquivo = arquivosRetornados.find((r: any) => r.nome === a.nome);
            return {
              ...a,
              id: arquivo?.id,
              isSaved: true,
              isNew: false,
              file: undefined,
            };
          }
          return a;
        })
      );

      return response;

    } catch (error) {
      console.error("[useModalTarefa] Erro no upload:", error);
      throw error;
    } finally {
      setUploadingAnexos(false);
    }
  }, [anexosParaUpload]);

  // ===========================================
  // DELETAR ANEXOS MARCADOS
  // ===========================================
  const deletarAnexosMarcados = useCallback(async () => {
    if (anexosParaDeletar.length === 0) return;

    console.log("[useModalTarefa] Deletando", anexosParaDeletar.length, "anexo(s)");

    for (const id of anexosParaDeletar) {
      try {
        await anexoService.excluirAnexo(id);
        console.log("   Deletado:", id);
      } catch (error) {
        console.error("   Erro:", id);
      }
    }

    setAnexosParaDeletar([]);
  }, [anexosParaDeletar]);

  // ===========================================
  // DRAG AND DROP
  // ===========================================
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    if (e.dataTransfer.files.length > 0) {
      adicionarAnexos(e.dataTransfer.files);
    }
  }, [adicionarAnexos]);

  return {
    formData,
    showDeleteConfirm,
    mostrarListaResponsaveis,
    toastMsg,
    toastType,
    anexos,
    anexosParaUpload,
    anexosParaDeletar,
    loadingAnexos,
    uploadingAnexos,
    isDraggingFile,
    handleInputChange,
    toggleResponsavel,
    showToast,
    handleClose,
    setShowDeleteConfirm,
    setMostrarListaResponsaveis,
    adicionarAnexos,
    removerAnexo,
    uploadAnexosPendentes,
    deletarAnexosMarcados,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
