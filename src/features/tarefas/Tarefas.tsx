import { useState, useEffect } from "react";
import Sidebar from "../../shared/components/Sidebar";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { FaCalendarAlt, FaRegUserCircle, FaTrash, FaPaperclip } from "react-icons/fa";
import ModalTarefa from "./Modal";
import ApiService from "../../services/ApiService";
import axios from "axios";

type Status = "Pendente" | "Desenvolvimento" | "Concluído"

interface Tarefa {
    id: string;
    nome: string;
    status: string;
    descricao: string;
    comentario?: string;
    prazoFinal?: string;
    projetoId?: string;
    anexo?: string[];
    usuarioIds?: string[];
    anexos?: AnexoInfo[];
}

interface AnexoInfo {
    id: string;
    nomeOriginal: string;
    contentType: string;
}

interface MembroProjeto {
    usuarioId: string;
    nome: string;
    email: string;
    criador: boolean;
}

export default function Tarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [projetoId, setProjetoId] = useState<string | null>(() => localStorage.getItem('projetoSelecionadoId'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editarTarefa, setEditarTarefa] = useState<Tarefa | null>(null);
    const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [membros, setMembros] = useState<MembroProjeto[]>([]);

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === 'projetoSelecionadoId') {
                const novo = localStorage.getItem('projetoSelecionadoId');
                setProjetoId(novo);
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    useEffect(() => {
        if (projetoId) {
            carregarTarefas(projetoId);
            carregarMembros(projetoId);
        } else {
            setTarefas([]);
            setMembros([]);
        }
    }, [projetoId]);

    async function carregarTarefas(pid: string) {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiService.listarTarefasDoProjeto(pid);
            console.log('📋 Tarefas carregadas:', data);

            const tarefasComAnexos = await Promise.all(
                (data || []).map(async (tarefa: Tarefa) => {
                    try {
                        const anexosResponse = await axios.get(`http://localhost:8080/api/anexos/tarefa/${tarefa.id}`);
                        console.log(`📎 Anexos da tarefa ${tarefa.nome}:`, anexosResponse.data);
                        return { ...tarefa, anexos: anexosResponse.data };
                    } catch (error) {
                        console.log(`⚠️ Erro ao carregar anexos da tarefa ${tarefa.nome}:`, error);
                        return { ...tarefa, anexos: [] };
                    }
                })
            );

            console.log('✅ Tarefas com anexos:', tarefasComAnexos);
            setTarefas(tarefasComAnexos);
        } catch (error: any) {
            console.error("Erro ao carregar tarefas:", error);
            setError(error?.message || 'Falha ao carregar');
        } finally {
            setLoading(false);
        }
    }

    async function carregarMembros(pid: string) {
        try {
            const lista = await ApiService.listarMembrosProjeto(pid);
            setMembros(lista || []);
        } catch (e) {
            console.error('Erro ao carregar membros do projeto', e);
            setMembros([]);
        }
    }

    function formatarData(data: string | undefined) {
        if (!data) return "";
        const date = new Date(data);
        const dia = String(date.getUTCDate()).padStart(2, '0');
        const mes = date.getUTCMonth();
        const ano = date.getUTCFullYear();
        const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        return `${dia} ${meses[mes]} ${ano}`;
    }

    function handleOpenCreate() {
        setEditarTarefa(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(tarefa: Tarefa) {
        setEditarTarefa(tarefa);
        setIsModalOpen(true);
    }

    async function handleSave(tarefaCriada: any) {
        if (projetoId) {
            await carregarTarefas(projetoId);
        }
        setIsModalOpen(false);
        setEditarTarefa(null);
    }

    async function handleDelete(tarefaId: string) {
        if (projetoId) {
            await carregarTarefas(projetoId);
        }
        setIsModalOpen(false);
        setEditarTarefa(null);
        setConfirmandoExclusaoId(null);
    }

    function iniciarExclusao(e: React.MouseEvent, tarefaId: string) {
        e.stopPropagation();
        if (confirmandoExclusaoId === tarefaId) {
            handleDeleteCard(tarefaId);
        } else {
            setConfirmandoExclusaoId(tarefaId);
            setTimeout(() => {
                setConfirmandoExclusaoId((curr) => (curr === tarefaId ? null : curr));
            }, 4000);
        }
    }

    async function handleDeleteCard(tarefaId: string) {
        try {
            await ApiService.excluirTarefa(tarefaId);
            if (projetoId) await carregarTarefas(projetoId);
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
        setConfirmandoExclusaoId(null);
    }

    function cancelarExclusao(e: React.MouseEvent) {
        e.stopPropagation();
        setConfirmandoExclusaoId(null);
    }

    async function onDragEnd(result: DropResult) {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const novoStatus = destination.droppableId as Status;
        const tarefa = tarefas.find(t => t.id === draggableId);

        if (!tarefa || tarefa.status === novoStatus) return;

        try {
            await ApiService.atualizarTarefa(draggableId, {
                nome: tarefa.nome,
                descricao: tarefa.descricao,
                status: novoStatus,
                comentario: tarefa.comentario || "",
                prazoFinal: tarefa.prazoFinal || null,
                projetoId: tarefa.projetoId || projetoId || "",
                usuarioIds: tarefa.usuarioIds || []
            });
            setTarefas(prev => prev.map(t => t.id === draggableId ? { ...t, status: novoStatus } : t));
        } catch (error) {
            console.error("Erro ao mover tarefa:", error);
        }
    }

    const getFileTypeLabel = (contentType: string): string => {
        if (contentType.startsWith('image/')) return 'IMG';
        if (contentType === 'application/pdf') return 'PDF';
        if (contentType.startsWith('video/')) return 'VÍD';
        return 'ARQ';
    };

    const getFileTypeColor = (contentType: string): string => {
        if (contentType.startsWith('image/')) return 'bg-blue-100 text-blue-700';
        if (contentType === 'application/pdf') return 'bg-red-100 text-red-700';
        if (contentType.startsWith('video/')) return 'bg-purple-100 text-purple-700';
        return 'bg-gray-100 text-gray-700';
    };

    const columns = [
        { id: "Pendente", nome: "Pendentes", color: "text-yellow-700" },
        { id: "Desenvolvimento", nome: "Desenvolvimento", color: "text-gray-500" },
        { id: "Concluído", nome: "Concluído", color: "text-green-700" }
    ];

    const renderConteudoColuna = (colId: string) => {
        if (loading) return <p className="text-sm text-gray-500 px-3">Carregando...</p>;
        if (error) return <p className="text-sm text-red-600 px-3">Erro: {error}</p>;
        const lista = tarefas.filter(t => t.status === colId);
        if (lista.length === 0) return <p className="text-sm italic text-gray-400 px-3 py-2">Nenhuma tarefa</p>;
        return null;
    };

    return (
        <div className="flex h-screen relative">
            <Sidebar />

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 bg-white rounded-3xl p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar">
                    <div className="flex flex-row justify-center gap-10 w-full flex-1">
                        {columns.map((col) => (
                            <Droppable key={col.id} droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex flex-col flex-1 bg-[#F2EEE9] rounded-xl shadow-2xl transition-colors overflow-y-auto max-h-[calc(94vh-10rem)] min-h-[calc(94vh-10rem)]
                                            ${snapshot.isDraggingOver ? "bg-blue-100" : ""}`}
                                    >
                                        <h5 className={`flex justify-center mb-4 text-2xl font-mono sticky top-0 z-10 bg-[#F2EEE9] py-2 ${col.color}`}>
                                            {col.nome}
                                        </h5>
                                        {renderConteudoColuna(col.id)}
                                        {tarefas.filter((t) => t.status === col.id).map((tarefa, index) => (
                                            <Draggable key={tarefa.id} draggableId={tarefa.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`p-3 m-2 bg-white rounded-xl shadow cursor-pointer transition relative ${snapshot.isDragging ? "bg-blue-200" : "hover:bg-gray-50"
                                                            }`}
                                                        onClick={() => handleOpenEdit(tarefa)}
                                                    >
                                                        {confirmandoExclusaoId === tarefa.id ? (
                                                            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                                                                <button
                                                                    onClick={(e) => iniciarExclusao(e, tarefa.id)}
                                                                    className="px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 whitespace-nowrap"
                                                                >
                                                                    Confirmar
                                                                </button>
                                                                <button
                                                                    onClick={cancelarExclusao}
                                                                    className="px-2 py-1 text-xs font-semibold bg-gray-300 text-gray-700 rounded hover:bg-gray-400 whitespace-nowrap"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => iniciarExclusao(e, tarefa.id)}
                                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        )}

                                                        <div className="flex flex-col justify-between">
                                                            <div className="flex flex-col justify-center gap-2 pr-6">
                                                                <span className="text-lg font-semibold">{tarefa.nome}</span>
                                                                <p className="text-sm text-gray-600">{tarefa.descricao}</p>
                                                                {tarefa.comentario && (
                                                                    <p className="text-sm text-gray-600 italic">"{tarefa.comentario}"</p>
                                                                )}

                                                                {tarefa.anexos && tarefa.anexos.length > 0 && (
                                                                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-sm">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <FaPaperclip className="text-blue-600" size={16} />
                                                                            <span className="text-sm font-bold text-blue-800">
                                                                                {tarefa.anexos.length} Anexo{tarefa.anexos.length > 1 ? 's' : ''}
                                                                            </span>
                                                                        </div>

                                                                        {/* Primeiro arquivo em DESTAQUE */}
                                                                        <div className="mb-2 bg-white p-3 rounded-lg border-2 border-blue-200 shadow-md">
                                                                            {/* TIPO DO ARQUIVO - GRANDE E VISÍVEL */}
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                {tarefa.anexos[0].contentType.startsWith('image/') && (
                                                                                    <>
                                                                                        <div className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-bold shadow-sm">
                                                                                            🖼️ IMAGEM
                                                                                        </div>
                                                                                        <span className="text-xs text-gray-500 font-medium">
                                                                                            {tarefa.anexos[0].contentType.split('/')[1].toUpperCase()}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                                {tarefa.anexos[0].contentType === 'application/pdf' && (
                                                                                    <div className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-bold shadow-sm">
                                                                                        📄 PDF
                                                                                    </div>
                                                                                )}
                                                                                {tarefa.anexos[0].contentType.startsWith('video/') && (
                                                                                    <>
                                                                                        <div className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm font-bold shadow-sm">
                                                                                            🎬 VÍDEO
                                                                                        </div>
                                                                                        <span className="text-xs text-gray-500 font-medium">
                                                                                            {tarefa.anexos[0].contentType.split('/')[1].toUpperCase()}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </div>

                                                                            {/* NOME DO ARQUIVO - GRANDE E VISÍVEL */}
                                                                            <p className="text-sm font-bold text-gray-900 break-words leading-tight" title={tarefa.anexos[0]?.nomeOriginal}>
                                                                                📎 {tarefa.anexos[0]?.nomeOriginal}
                                                                            </p>
                                                                        </div>

                                                                        {/* Outros arquivos */}
                                                                        {tarefa.anexos.length > 1 && (
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {tarefa.anexos.slice(1, 4).map((anexo: AnexoInfo) => (
                                                                                    <div
                                                                                        key={anexo.id}
                                                                                        className="text-xs px-2 py-1 bg-white border-2 border-gray-300 rounded font-semibold text-gray-700 truncate max-w-[100px] shadow-sm"
                                                                                        title={anexo.nomeOriginal}
                                                                                    >
                                                                                        {anexo.nomeOriginal.length > 12
                                                                                            ? anexo.nomeOriginal.substring(0, 12) + '...'
                                                                                            : anexo.nomeOriginal}
                                                                                    </div>
                                                                                ))}
                                                                                {tarefa.anexos.length > 4 && (
                                                                                    <div className="text-xs px-3 py-1 bg-gray-300 rounded-md font-bold text-gray-800 shadow-sm">
                                                                                        +{tarefa.anexos.length - 4} mais
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-between mt-4">
                                                                <p className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <FaRegUserCircle />
                                                                    {(() => {
                                                                        const ids = tarefa.usuarioIds || [];
                                                                        if (ids.length === 0) return 'Sem responsável';
                                                                        const nomes = ids
                                                                            .map(id => membros.find(m => m.usuarioId === id)?.nome || id)
                                                                            .filter(Boolean);
                                                                        if (nomes.length <= 2) return nomes.join(', ');
                                                                        return nomes.slice(0, 2).join(', ') + ` (+${nomes.length - 2})`;
                                                                    })()}
                                                                </p>
                                                                <p className="flex items-center gap-1 text-xs text-gray-600">
                                                                    {formatarData(tarefa.prazoFinal)}
                                                                    <FaCalendarAlt />
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                    <div
                        className="flex items-center justify-center bg-[#377CD4] w-full h-16 rounded-lg cursor-pointer mt-4 hover:bg-[#2a5fa0] transition-colors"
                        onClick={handleOpenCreate}
                    >
                        <h5 className="text-3xl text-white font-mono">Criar Tarefa</h5>
                    </div>
                </div>
            </DragDropContext>

            <ModalTarefa
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                projetoId={projetoId || ""}
                membrosProjeto={membros.map(m => ({ id: m.usuarioId, nome: m.nome, email: m.email }))}
                initialData={editarTarefa ? {
                    id: editarTarefa.id,
                    name: editarTarefa.nome || "",
                    description: editarTarefa.descricao || "",
                    responsible: editarTarefa.usuarioIds || [],
                    endDate: editarTarefa.prazoFinal ? editarTarefa.prazoFinal.split('T')[0] : "",
                    status: editarTarefa.status as Status,
                    comment: editarTarefa.comentario || "",
                } : undefined}
            />
        </div>
    )
}