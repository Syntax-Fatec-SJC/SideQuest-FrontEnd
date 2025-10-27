import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { anexoService, type AnexoBackend } from '../../services/AnexoService';

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
    }) => void;
    onDelete: (tarefaId: string) => void;
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
    status: 'Pendente' | 'Desenvolvimento' | 'Concluído';
    comment: string;
}

interface FileWithPreview {
    file: File;
    preview: string;
    type: 'image' | 'pdf' | 'video';
}

type FormField = keyof FormData;
type StatusType = FormData['status'];

const API_BASE_URL = 'http://localhost:8080';

export default function ModalTarefa({ isOpen, onClose, onSave, onDelete, initialData, membrosProjeto = [] }: ModalTarefaProps) {
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
    const [anexosExistentes, setAnexosExistentes] = useState<AnexoBackend[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    // Resetar e carregar dados quando o Modal abrir
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                console.log('✓ Modal: Carregando tarefa existente', initialData);
                setFormData({
                    name: initialData.name,
                    description: initialData.description,
                    responsible: initialData.responsible,
                    endDate: initialData.endDate,
                    status: initialData.status,
                    comment: initialData.comment
                });
                carregarAnexosExistentes(initialData.id);
            } else {
                console.log('✓ Modal: Criando nova tarefa');
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
            setMostrarListaResponsaveis(false);
        }
    }, [initialData, isOpen]);

    const carregarAnexosExistentes = async (tarefaId: string) => {
        try {
            console.log('Modal: Buscando anexos da tarefa', tarefaId);
            const data = await anexoService.listarPorTarefa(tarefaId);
            setAnexosExistentes(data);
            console.log('✓ Modal: Anexos carregados:', data.length, 'arquivos');
        } catch (error) {
            console.error('✗ Modal: Erro ao carregar anexos:', error);
            setAnexosExistentes([]);
        }
    };

    useEffect(() => {
        return () => {
            anexos.forEach(anexo => {
                if (anexo.preview.startsWith('blob:')) URL.revokeObjectURL(anexo.preview);
            });
        };
    }, [anexos]);

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

    const handleDelete = (): void => {
        if (showDeleteConfirm) {
            if (initialData && initialData.id) {
                console.log('Modal: Deletando tarefa', initialData.id);
                onDelete(initialData.id);
            }
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleSave = (): void => {
        console.log('Modal: Salvando tarefa com dados:', formData);
        console.log('Modal: Responsáveis selecionados:', formData.responsible);
        console.log('Modal: Anexos novos:', anexos.length);

        const files = anexos.map(anexo => anexo.file);
        onSave({ ...formData, files });
    };

    const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        handleInputChange('comment', e.target.value);
    };

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
        handleInputChange('endDate', e.target.value);
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

            if (file.size > MAX_FILE_SIZE) {
                alert(`Arquivo "${file.name}" excede o tamanho máximo de 50MB`);
                continue;
            }

            let preview = '';
            let type: 'image' | 'pdf' | 'video' = 'image';

            if (file.type.startsWith('image/')) {
                preview = URL.createObjectURL(file);
                type = 'image';
            } else if (file.type === 'application/pdf') {
                type = 'pdf';
                preview = URL.createObjectURL(file);
            } else if (file.type.startsWith('video/')) {
                preview = URL.createObjectURL(file);
                type = 'video';
            }

            novosAnexos.push({ file, preview, type });
        }

        setAnexos(prev => [...prev, ...novosAnexos]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoverAnexo = (index: number): void => {
        const anexo = anexos[index];
        if (anexo.preview.startsWith('blob:')) {
            URL.revokeObjectURL(anexo.preview);
        }
        setAnexos(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoverAnexoExistente = async (anexoId: string): Promise<void> => {
        if (!confirm('Deseja realmente excluir este arquivo do MongoDB?')) return;

        try {
            await anexoService.deletar(anexoId);
            setAnexosExistentes(prev => prev.filter(a => a.id !== anexoId));
            console.log('✓ Modal: Anexo deletado do MongoDB:', anexoId);
        } catch (error) {
            console.error('✗ Modal: Erro ao deletar anexo:', error);
            alert('Erro ao excluir arquivo. Tente novamente.');
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

    const handleVisualizarAnexoExistente = (anexo: AnexoBackend): void => {
        window.open(`${API_BASE_URL}${anexo.urlDownload}`, '_blank');
    };

    const getTipoAnexoExistente = (contentType: string): 'image' | 'pdf' | 'video' => {
        if (contentType.startsWith('image/')) return 'image';
        if (contentType === 'application/pdf') return 'pdf';
        if (contentType.startsWith('video/')) return 'video';
        return 'pdf';
    };

    const membrosOrdenados = [...membrosProjeto].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="bg-red-50 rounded-3xl p-8 m-2">

                        <header className="relative mb-8">
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
                                className="absolute -top-4 -right-4 w-16 h-16 rounded-full hover:scale-110 transition-transform"
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
                                            className="text-xs text-blue-600 hover:underline font-semibold"
                                        >
                                            {mostrarListaResponsaveis ? 'ocultar' : 'selecionar'}
                                        </button>
                                    </div>

                                    {/* BADGES DOS RESPONSÁVEIS SELECIONADOS */}
                                    {formData.responsible.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.responsible.map(r => {
                                                const m = membrosProjeto.find(m => m.id === r);
                                                return (
                                                    <span key={r} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                        {m?.nome || r}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* LISTA DE MEMBROS COM CHECKBOXES */}
                                    {mostrarListaResponsaveis && (
                                        <div className="max-h-40 overflow-auto pr-1 space-y-1 border rounded p-3 bg-gray-50">
                                            {membrosOrdenados.length === 0 && (
                                                <p className="text-xs text-gray-400 italic">Nenhum membro disponível. Cadastre na página Membros.</p>
                                            )}
                                            {membrosOrdenados.map(m => {
                                                const checked = formData.responsible.includes(m.id);
                                                return (
                                                    <label key={m.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-blue-50 p-2 rounded transition">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleResponsavel(m.id)}
                                                            className="accent-blue-600 w-4 h-4"
                                                        />
                                                        <span className="text-gray-700 font-medium">{m.nome}</span>
                                                        <span className="text-gray-400 text-xs">({m.email})</span>
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
                                            onChange={handleDateChange}
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
                                            className="text-sm font-bold text-black text-opacity-50 outline-none bg-transparent text-center"
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
                                        className="flex justify-center items-center h-full cursor-pointer hover:bg-blue-50 hover:scale-105 hover:shadow-xl transition-all duration-300 rounded-2xl border-2 border-transparent hover:border-blue-300"
                                        title="Clique para anexar arquivos"
                                    >
                                        <img
                                            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-09-15/fnh8pRWwYV.png"
                                            alt="Upload"
                                            className="w-11 h-11 mr-4 transition-transform duration-300 hover:rotate-12"
                                        />
                                        <span className="text-xl text-black text-opacity-50 font-poppins transition-colors duration-300 hover:text-blue-600">
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
                                    {(anexosExistentes.length + anexos.length) > 0 && (
                                        <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold animate-pulse">
                                            {anexosExistentes.length + anexos.length}
                                        </span>
                                    )}
                                </div>

                                {anexosExistentes.length === 0 && anexos.length === 0 ? (
                                    <div className="h-32 flex items-center justify-center text-gray-400">
                                        <span>Nenhum arquivo anexado</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {anexosExistentes.map((anexo) => {
                                            const tipo = getTipoAnexoExistente(anexo.contentType);
                                            return (
                                                <div key={anexo.id} className="relative group">
                                                    <div
                                                        onClick={() => handleVisualizarAnexoExistente(anexo)}
                                                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                                        title="Clique para visualizar"
                                                    >
                                                        {tipo === 'image' && (
                                                            <img
                                                                src={`${API_BASE_URL}${anexo.urlDownload}`}
                                                                alt={anexo.nomeOriginal}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                        {tipo === 'pdf' && (
                                                            <div className="flex flex-col items-center justify-center text-red-500">
                                                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="text-xs mt-1 font-semibold">PDF</span>
                                                            </div>
                                                        )}
                                                        {tipo === 'video' && (
                                                            <div className="flex flex-col items-center justify-center text-purple-500">
                                                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                                </svg>
                                                                <span className="text-xs mt-1 font-semibold">MP4</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoverAnexoExistente(anexo.id)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                        title="Remover arquivo do MongoDB"
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
                                            );
                                        })}

                                        {anexos.map((anexo, index) => (
                                            <div key={`new-${index}`} className="relative group">
                                                <div className="absolute -top-2 -left-2 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-bounce">
                                                    NOVO
                                                </div>
                                                <div
                                                    onClick={() => handleVisualizarAnexo(anexo)}
                                                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-200 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                            {initialData && (
                                <button
                                    onClick={handleDelete}
                                    className={`px-6 py-3 rounded-full font-semibold text-sm text-white transition-all duration-300 shadow-lg transform hover:scale-110 ${showDeleteConfirm
                                        ? 'bg-red-700 hover:bg-red-800 animate-pulse'
                                        : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {showDeleteConfirm ? 'CONFIRMAR EXCLUSÃO' : 'EXCLUIR'}
                                </button>
                            )}

                            <button
                                onClick={handleSave}
                                className="ml-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold text-sm text-white transition-all duration-300 shadow-lg transform hover:scale-110 hover:shadow-2xl"
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