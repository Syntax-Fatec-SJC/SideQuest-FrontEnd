import { useEffect, useState, useRef, type ChangeEvent } from 'react';

interface ModalTarefaProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        name: string;
        description: string;
        responsible: string[];
        endDate: string;
        status: "Pendente" | "Desenvolvimento" | "Concluído";
        comment: string;
        files: File[];
    }) => Promise<void>;
    onDelete: (tarefaId: string) => Promise<void>;
    projetoId: string; // ✅ agora aceito (necessário em Tarefas.tsx)
    membrosProjeto?: { id: string; nome: string; email: string }[];
    initialData?: {
        id: string;
        name: string;
        description: string;
        responsible: string[];
        endDate: string;
        status: "Pendente" | "Desenvolvimento" | "Concluído";
        comment: string;
    };
}

interface FormData {
    name: string;
    description: string;
    responsible: string[];
    endDate: string;
    status: "Pendente" | "Desenvolvimento" | "Concluído";
    comment: string;
}

interface FileWithPreview {
    file: File;
    preview: string;
    type: "image" | "pdf" | "video";
}

type FormField = keyof FormData;
type StatusType = FormData["status"];

export default function ModalTarefa({
    isOpen,
    onClose,
    onSave,
    onDelete,
    projetoId,
    initialData,
    membrosProjeto = [],
}: ModalTarefaProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mostrarListaResponsaveis, setMostrarListaResponsaveis] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
        responsible: [],
        endDate: "",
        status: "Pendente",
        comment: "",
    });

    const [anexos, setAnexos] = useState<FileWithPreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ALLOWED_TYPES = {
        "image/png": ".png",
        "image/jpeg": ".jpeg,.jpg",
        "application/pdf": ".pdf",
        "video/mp4": ".mp4",
    };
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    // Atualiza o formulário quando o modal abre
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
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
        setAnexos([]);
    }, [initialData, isOpen]);

    // Limpa URLs temporárias ao desmontar
    useEffect(() => {
        return () => {
            anexos.forEach((anexo) => {
                if (anexo.preview.startsWith("blob:")) URL.revokeObjectURL(anexo.preview);
            });
        };
    }, [anexos]);

    const handleInputChange = (field: FormField, value: string | string[] | StatusType): void => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleResponsavel = (usuarioId: string) => {
        setFormData((prev) => {
            const jaExiste = prev.responsible.includes(usuarioId);
            return {
                ...prev,
                responsible: jaExiste
                    ? prev.responsible.filter((id) => id !== usuarioId)
                    : [...prev.responsible, usuarioId],
            };
        });
    };

    const handleDelete = async (): Promise<void> => {
        if (showDeleteConfirm) {
            if (initialData?.id) {
                await onDelete(initialData.id);
            }
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleSave = async (): Promise<void> => {
        const files = anexos.map((anexo) => anexo.file);
        await onSave({ ...formData, files });
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files = e.target.files;
        if (!files) return;

        const novosAnexos: FileWithPreview[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
                alert(`Arquivo "${file.name}" não é permitido.`);
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                alert(`Arquivo "${file.name}" é muito grande. Máximo: 50MB.`);
                continue;
            }

            const type: FileWithPreview["type"] =
                file.type.startsWith("image/") ? "image" :
                    file.type === "application/pdf" ? "pdf" : "video";

            const preview = type === "image" || type === "video" ? URL.createObjectURL(file) : "";
            novosAnexos.push({ file, preview, type });
        }

        setAnexos((prev) => [...prev, ...novosAnexos]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoverAnexo = (index: number): void => {
        setAnexos((prev) => {
            const anexo = prev[index];
            if (anexo.preview.startsWith("blob:")) URL.revokeObjectURL(anexo.preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleVisualizarAnexo = (anexo: FileWithPreview): void => {
        if (anexo.type === "image" || anexo.type === "video") {
            window.open(anexo.preview, "_blank");
        } else if (anexo.type === "pdf") {
            const fileURL = URL.createObjectURL(anexo.file);
            window.open(fileURL, "_blank");
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const membrosOrdenados = [...membrosProjeto].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="bg-red-50 rounded-3xl p-8 m-2">
                    {/* HEADER */}
                    <header className="relative mb-8">
                        <input
                            type="text"
                            placeholder="Digite o nome da tarefa..."
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full text-center text-2xl font-semibold text-slate-800 bg-transparent outline-none mt-4 placeholder:text-slate-400"
                        />
                        <div className="w-80 h-px bg-slate-600 mx-auto mt-4"></div>
                        <button
                            onClick={onClose}
                            className="absolute -top-4 -right-4 w-16 h-16 rounded-full"
                        >
                            <img
                                src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/NaTQuP3JqU.png"
                                alt="Fechar"
                                className="w-full h-full"
                            />
                        </button>
                    </header>

                    {/* BODY */}
                    <main className="space-y-6">
                        {/* Responsáveis + Descrição */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <section className="bg-white rounded-3xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm text-black text-opacity-50 font-poppins">
                                        Responsáveis
                                    </h2>
                                    <button
                                        onClick={() => setMostrarListaResponsaveis((v) => !v)}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        {mostrarListaResponsaveis ? "ocultar" : "selecionar"}
                                    </button>
                                </div>
                                {formData.responsible.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.responsible.map((r) => {
                                            const m = membrosProjeto.find((m) => m.id === r);
                                            return (
                                                <span
                                                    key={r}
                                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                >
                                                    {m?.nome || r}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                                {mostrarListaResponsaveis && (
                                    <div className="max-h-40 overflow-auto pr-1 space-y-1 border rounded p-2 bg-gray-50">
                                        {membrosOrdenados.map((m) => {
                                            const checked = formData.responsible.includes(m.id);
                                            return (
                                                <label
                                                    key={m.id}
                                                    className="flex items-center gap-2 text-xs cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleResponsavel(m.id)}
                                                        className="accent-blue-600"
                                                    />
                                                    <span className="text-gray-700 font-medium">
                                                        {m.nome}
                                                    </span>
                                                    <span className="text-gray-400">{m.email}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            <section className="bg-white rounded-3xl p-6">
                                <h2 className="text-sm text-black text-opacity-50 mb-2">
                                    Descrição
                                </h2>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange("description", e.target.value)
                                    }
                                    placeholder="Digite a descrição..."
                                    className="w-full h-20 text-xs font-bold text-black text-opacity-50 resize-none outline-none placeholder-gray-400 border border-gray-200 rounded p-2"
                                />
                            </section>
                        </div>

                        {/* Data, Status, Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <section className="bg-white rounded-3xl p-6">
                                <h2 className="text-xs text-black text-opacity-50 mb-2">Prazo</h2>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                                    className="w-full text-sm font-bold text-gray-700 outline-none"
                                />
                            </section>

                            <section className="bg-white rounded-3xl p-6">
                                <h2 className="text-xs text-black text-opacity-50 mb-2">Status</h2>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        handleInputChange("status", e.target.value as StatusType)
                                    }
                                    className="text-sm font-bold text-gray-700 outline-none bg-transparent"
                                >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Desenvolvimento">Desenvolvimento</option>
                                    <option value="Concluído">Concluído</option>
                                </select>
                            </section>

                            <section className="bg-white rounded-3xl p-6 flex flex-col">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".png,.jpg,.jpeg,.pdf,.mp4"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex justify-center items-center h-full hover:bg-gray-50 transition rounded-2xl"
                                >
                                    <span className="text-xl text-black text-opacity-50">
                                        📎 Anexar arquivo
                                    </span>
                                </button>
                            </section>
                        </div>

                        {/* Lista de arquivos */}
                        <section className="bg-white rounded-3xl p-6">
                            <h2 className="text-2xl text-black text-opacity-50 mb-4">Arquivos</h2>
                            {anexos.length === 0 ? (
                                <div className="h-32 flex items-center justify-center text-gray-400">
                                    Nenhum arquivo anexado
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {anexos.map((anexo, index) => (
                                        <div key={index} className="relative group">
                                            <div
                                                onClick={() => handleVisualizarAnexo(anexo)}
                                                className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:shadow-lg transition"
                                                title="Clique para visualizar"
                                            >
                                                {anexo.type === "image" && (
                                                    <img
                                                        src={anexo.preview}
                                                        alt={anexo.file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                {anexo.type === "pdf" && (
                                                    <div className="text-red-500 font-bold text-sm">
                                                        PDF
                                                    </div>
                                                )}
                                                {anexo.type === "video" && (
                                                    <div className="text-purple-500 font-bold text-sm">
                                                        Vídeo
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoverAnexo(index)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                            <div className="mt-2">
                                                <p
                                                    className="text-xs text-gray-700 truncate font-medium"
                                                    title={anexo.file.name}
                                                >
                                                    {anexo.file.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatFileSize(anexo.file.size)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Comentário */}
                        <section className="bg-white rounded-3xl p-6">
                            <textarea
                                value={formData.comment}
                                onChange={(e) => handleInputChange("comment", e.target.value)}
                                placeholder="Comentário..."
                                className="w-full h-20 text-xl text-black text-opacity-50 resize-none outline-none placeholder-gray-400"
                            />
                        </section>
                    </main>

                    {/* FOOTER */}
                    <footer className="flex justify-between items-center mt-8">
                        <button
                            onClick={handleDelete}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm text-white transition ${showDeleteConfirm
                                ? "bg-red-700"
                                : "bg-red-500 hover:bg-red-600"
                                }`}
                        >
                            {showDeleteConfirm ? "CONFIRMAR EXCLUSÃO" : "EXCLUIR"}
                        </button>

                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm text-white transition"
                        >
                            SALVAR
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
