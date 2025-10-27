import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import axios from 'axios';

interface ModalTarefaProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (tarefa: any) => void;
    onDelete: (tarefaId: string) => void;
    membrosProjeto?: { id: string; nome: string; email: string }[];
    projetoId: string;
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
    status: 'Pendente' | 'Desenvolvimento' | 'Concluído';
    comment: string;
}

interface FileWithPreview {
    file: File;
    preview: string;
    type: 'image' | 'pdf' | 'video';
}

interface AnexoExistente {
    id: string;
    nomeOriginal: string;
    contentType: string;
    tamanho: number;
    urlDownload: string;
}

type FormField = keyof FormData;
type StatusType = FormData['status'];

export default function ModalTarefa({ isOpen, onClose, onSave, onDelete, initialData, membrosProjeto = [], projetoId }: ModalTarefaProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [mostrarListaResponsaveis, setMostrarListaResponsaveis] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        responsible: [],
        endDate: '',
        status: 'Pendente',
        comment: ''
    });

    const [anexos, setAnexos] = useState<FileWithPreview[]>([]);
    const [anexosExistentes, setAnexosExistentes] = useState<AnexoExistente[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ALLOWED_TYPES = {
        'image/png': '.png',
        'image/jpeg': '.jpeg,.jpg',
        'application/pdf': '.pdf',
        'video/mp4': '.mp4'
    };

    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    // ✅ Verifica se é uma tarefa nova (sem initialData)
    const isNovaTarefa = !initialData;
    // Garante que o token exista no localStorage
    useEffect(() => {
        const tokenExistente = localStorage.getItem('token');

        // se não tiver token, cria um token de teste ou pega de um contexto global
        if (!tokenExistente) {
            // 👉 Troque o valor abaixo pelo token real do seu backend, se quiser testar manualmente
            const tokenFake = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake-token-teste';
            localStorage.setItem('token', tokenFake);
            console.log('⚠️ Token de teste adicionado no localStorage:', tokenFake);
        }
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.id) {
                carregarAnexosExistentes(initialData.id);
            }
        } else {
            setFormData({
                name: "",
                description: "",
                responsible: [],
                endDate: "",
                status: "Pendente",
                comment: "",
            });
            setAnexosExistentes([]);
        }
        setShowDeleteConfirm(false);
        setAnexos([]);
    }, [initialData, isOpen]);

    useEffect(() => {
        return () => {
            anexos.forEach(anexo => {
                if (anexo.preview.startsWith('blob:')) URL.revokeObjectURL(anexo.preview);
            });
        };
    }, [anexos]);

    async function carregarAnexosExistentes(tarefaId: string) {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await axios.get(`http://localhost:8080/api/anexos/tarefa/${tarefaId}`, { headers });
            setAnexosExistentes(response.data);
        } catch (error) {
            console.error('Erro ao carregar anexos existentes:', error);
        }
    }

    const handleInputChange = (field: FormField, value: string | string[] | StatusType): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleResponsavel = (usuarioId: string) => {
        setFormData(prev => {
            const jaExiste = prev.responsible.includes(usuarioId);
            return {
                ...prev,
                responsible: jaExiste
                    ? prev.responsible.filter(id => id !== usuarioId)
                    : [...prev.responsible, usuarioId]
            };
        });
    };

    const handleDelete = async (): Promise<void> => {
        if (showDeleteConfirm) {
            if (initialData && initialData.id) {
                try {
                    // ✅ PEGA O TOKEN DO LOCALSTORAGE
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('Erro: Você precisa estar autenticado!');
                        return;
                    }

                    // ✅ ADICIONA O TOKEN NO HEADER
                    await axios.delete(`http://localhost:8080/excluir/tarefas/${initialData.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    onDelete(initialData.id);
                    alert('Tarefa excluída com sucesso!');
                    onClose();
                } catch (error: any) {
                    console.error('Erro ao excluir tarefa:', error);
                    alert('Erro ao excluir tarefa: ' + (error.response?.data?.erro || error.message));
                }
            }
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleSave = async (): Promise<void> => {
        if (!projetoId) {
            alert('ERRO: projetoId não foi fornecido!');
            return;
        }

        if (!formData.name || formData.name.trim() === '') {
            alert('Por favor, preencha o nome da tarefa!');
            return;
        }

        try {
            // ✅ PEGA O TOKEN DO LOCALSTORAGE
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Erro: Você precisa estar autenticado!');
                return;
            }

            const formDataToSend = new FormData();

            let prazoFinalDate = null;
            if (formData.endDate && formData.endDate.trim() !== '') {
                prazoFinalDate = new Date(formData.endDate).toISOString();
            }

            const tarefaJson = {
                nome: formData.name,
                descricao: formData.description || "",
                usuarioIds: formData.responsible || [],
                prazoFinal: prazoFinalDate,
                status: formData.status,
                comentario: formData.comment || "",
                projetoId: projetoId
            };

            formDataToSend.append('tarefa', new Blob([JSON.stringify(tarefaJson)], {
                type: 'application/json'
            }));

            if (anexos.length > 0) {
                anexos.forEach((anexo) => {
                    formDataToSend.append('files', anexo.file);
                });
            }

            const url = initialData?.id
                ? `http://localhost:8080/atualizar/tarefas/${initialData.id}`
                : 'http://localhost:8080/cadastrar/tarefas';

            // ✅ ADICIONA O TOKEN NO HEADER
            const response = initialData?.id
                ? await axios.put(url, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                })
                : await axios.post(url, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

            alert(initialData?.id ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!');

            if (onSave) {
                onSave(response.data);
            }

            onClose();

        } catch (error: any) {
            console.error('Erro ao salvar tarefa:', error);

            let errorMessage = 'Erro ao salvar tarefa.';

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.erro) {
                    errorMessage = error.response.data.erro;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert('Erro: ' + errorMessage);
        }
    };

    const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        handleInputChange('comment', e.target.value);
    };

    const handleDateChange = (field: 'endDate') => (e: ChangeEvent<HTMLInputElement>): void => {
        handleInputChange(field, e.target.value);
    };

    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        handleInputChange('status', e.target.value as StatusType);
    };

    const handleClickAnexar = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const novosAnexos: FileWithPreview[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
                alert(`Arquivo "${file.name}" não é permitido. Use apenas PNG, JPEG, PDF ou MP4.`);
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                alert(`Arquivo "${file.name}" é muito grande. Tamanho máximo: 50MB.`);
                continue;
            }

            let fileType: 'image' | 'pdf' | 'video';
            if (file.type.startsWith('image/')) fileType = 'image';
            else if (file.type === 'application/pdf') fileType = 'pdf';
            else fileType = 'video';

            const preview = (fileType === 'image' || fileType === 'video') ? URL.createObjectURL(file) : '';

            novosAnexos.push({ file, preview, type: fileType });
        }

        setAnexos(prev => [...prev, ...novosAnexos]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoverAnexo = (index: number): void => {
        setAnexos(prev => {
            const anexo = prev[index];
            if (anexo.preview.startsWith('blob:')) URL.revokeObjectURL(anexo.preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleRemoverAnexoExistente = async (anexoId: string): Promise<void> => {
        if (!window.confirm('Deseja realmente excluir este anexo?')) return;

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            await axios.delete(`http://localhost:8080/api/anexos/${anexoId}`, { headers });
            setAnexosExistentes(prev => prev.filter(a => a.id !== anexoId));
            alert('Anexo excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir anexo:', error);
            alert('Erro ao excluir anexo.');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleVisualizarAnexo = (anexo: FileWithPreview): void => {
        if (anexo.type === 'image' || anexo.type === 'video') {
            window.open(anexo.preview, '_blank');
        } else if (anexo.type === 'pdf') {
            const fileURL = URL.createObjectURL(anexo.file);
            window.open(fileURL, '_blank');
        }
    };

    const handleVisualizarAnexoExistente = (anexo: AnexoExistente): void => {
        window.open(`http://localhost:8080${anexo.urlDownload}`, '_blank');
    };

    const getFileIcon = (contentType: string) => {
        if (contentType.startsWith('image/')) {
            return (
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        }
        if (contentType === 'application/pdf') {
            return (
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        }
        if (contentType.startsWith('video/')) {
            return (
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
            );
        }
        return null;
    };

    const membrosOrdenados = [...membrosProjeto].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="bg-red-50 rounded-3xl p-8 m-2">

                        <header className="relative mb-8">
                            {/* ✅ TAG "NOVO" ADICIONADA - Aparece apenas quando é uma tarefa nova */}
                            {isNovaTarefa && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                                    <span className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-bold shadow-lg animate-pulse">
                                        ✨ NOVO
                                    </span>
                                </div>
                            )}

                            <input
                                type="text"
                                placeholder="Digite o nome da tarefa..."
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
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

                        <main className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <section className="bg-white rounded-3xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/y0xgE4hNy9.png"
                                                alt="Usuário"
                                                className="w-6 h-6"
                                            />
                                            <h2 className="text-sm text-black text-opacity-50 font-poppins">Responsáveis</h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMostrarListaResponsaveis(v => !v)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {mostrarListaResponsaveis ? 'ocultar' : 'selecionar'}
                                        </button>
                                    </div>
                                    {formData.responsible.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.responsible.map(r => {
                                                const m = membrosProjeto.find(m => m.id === r);
                                                return (
                                                    <span key={r} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                        {m?.nome || r}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {mostrarListaResponsaveis && (
                                        <div className="max-h-40 overflow-auto pr-1 space-y-1 border rounded p-2 bg-gray-50">
                                            {membrosOrdenados.length === 0 && (
                                                <p className="text-xs text-gray-400">Nenhum membro disponível</p>
                                            )}
                                            {membrosOrdenados.map(m => {
                                                const checked = formData.responsible.includes(m.id);
                                                return (
                                                    <label key={m.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleResponsavel(m.id)}
                                                            className="accent-blue-600"
                                                        />
                                                        <span className="text-gray-700 font-medium">{m.nome}</span>
                                                        <span className="text-gray-400">{m.email}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>

                                <section className="bg-white rounded-3xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/KNtb3tMQCX.png"
                                            alt="Documento"
                                            className="w-6 h-6"
                                        />
                                        <h2 className="text-sm text-black text-opacity-50 font-poppins">Descrição</h2>
                                    </div>

                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Digite a descrição da tarefa..."
                                        className="w-full h-20 text-xs font-bold text-black text-opacity-50 resize-none outline-none placeholder-black placeholder-opacity-50 border border-gray-200 rounded p-2"
                                    />
                                </section>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <section className="bg-white rounded-3xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/MLnEE1uNpx.png"
                                            alt="Calendário"
                                            className="w-7 h-7"
                                        />
                                        <h2 className="text-xs text-black text-opacity-50 font-poppins">Prazo</h2>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={handleDateChange('endDate')}
                                            className="w-full text-sm font-bold text-black text-opacity-50 outline-none"
                                        />
                                    </div>
                                </section>

                                <section className="bg-white rounded-3xl p-6 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/TunmLKqMtD.png"
                                            alt="Status"
                                            className="w-4 h-4"
                                        />
                                        <h2 className="text-xs text-black text-opacity-50 font-poppins">Status</h2>
                                    </div>
                                    <div className="flex justify-center items-center flex-1">
                                        <select
                                            value={formData.status}
                                            onChange={handleStatusChange}
                                            className="text-sm font-bold text-black text-opacity-50 outline-none bg-transparent text-center relative z-10"
                                        >
                                            <option value="Pendente">Pendente</option>
                                            <option value="Desenvolvimento">Desenvolvimento</option>
                                            <option value="Concluído">Concluído</option>
                                        </select>
                                    </div>
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
                                        onClick={handleClickAnexar}
                                        type="button"
                                        className="flex justify-center items-center h-full cursor-pointer hover:bg-gray-50 hover:scale-105 transition-all duration-200 rounded-2xl"
                                    >
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/fnh8pRWwYV.png"
                                            alt="Upload"
                                            className="w-11 h-11 mr-4"
                                        />
                                        <span className="text-xl text-black text-opacity-50 font-poppins">
                                            Anexar um arquivo
                                        </span>
                                    </button>
                                </section>
                            </div>

                            <section className="bg-white rounded-3xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/PkXAyxCnPq.png"
                                        alt="Arquivos"
                                        className="w-10 h-10"
                                    />
                                    <h2 className="text-2xl text-black text-opacity-50 font-poppins">Arquivos</h2>
                                    {(anexos.length + anexosExistentes.length) > 0 && (
                                        <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                            {anexos.length + anexosExistentes.length}
                                        </span>
                                    )}
                                </div>

                                {anexos.length === 0 && anexosExistentes.length === 0 ? (
                                    <div className="h-32 flex items-center justify-center text-gray-400">
                                        <span>Nenhum arquivo anexado</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {anexosExistentes.map((anexo) => (
                                            <div key={anexo.id} className="relative group">
                                                <div
                                                    onClick={() => handleVisualizarAnexoExistente(anexo)}
                                                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 hover:shadow-lg transition-all duration-200 text-blue-600"
                                                    title="Clique para visualizar"
                                                >
                                                    {getFileIcon(anexo.contentType)}
                                                </div>

                                                <button
                                                    onClick={() => handleRemoverAnexoExistente(anexo.id)}
                                                    type="button"
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                    title="Remover arquivo"
                                                >
                                                    ×
                                                </button>

                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-700 truncate font-medium" title={anexo.nomeOriginal}>
                                                        {anexo.nomeOriginal}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatFileSize(anexo.tamanho)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {anexos.map((anexo, index) => (
                                            <div key={index} className="relative group">
                                                <div
                                                    onClick={() => handleVisualizarAnexo(anexo)}
                                                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:shadow-lg transition-all duration-200"
                                                    title="Clique para visualizar"
                                                >
                                                    {anexo.type === 'image' && (
                                                        <img
                                                            src={anexo.preview}
                                                            alt={anexo.file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                    {anexo.type === 'pdf' && (
                                                        <div className="flex flex-col items-center justify-center text-red-500">
                                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-xs mt-1 font-semibold">PDF</span>
                                                        </div>
                                                    )}
                                                    {anexo.type === 'video' && (
                                                        <div className="flex flex-col items-center justify-center text-purple-500">
                                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                            </svg>
                                                            <span className="text-xs mt-1 font-semibold">MP4</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleRemoverAnexo(index)}
                                                    type="button"
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                    title="Remover arquivo"
                                                >
                                                    ×
                                                </button>

                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-700 truncate font-medium" title={anexo.file.name}>
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

                            <section className="bg-white rounded-3xl p-6">
                                <textarea
                                    value={formData.comment}
                                    onChange={handleCommentChange}
                                    placeholder="Comentário..."
                                    className="w-full h-20 text-xl text-black text-opacity-50 font-inter resize-none outline-none placeholder-black placeholder-opacity-50"
                                />
                            </section>
                        </main>

                        <footer className="flex justify-between items-center mt-8">
                            <button
                                onClick={handleDelete}
                                type="button"
                                className={`px-4 py-2 rounded-lg font-semibold text-sm text-red-50 transition-colors ${showDeleteConfirm ? 'bg-red-700' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {showDeleteConfirm ? 'CONFIRMAR EXCLUSÃO' : 'EXCLUIR'}
                            </button>

                            <button
                                onClick={handleSave}
                                type="button"
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-sm text-red-50 transition-colors"
                            >
                                SALVAR
                            </button>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}