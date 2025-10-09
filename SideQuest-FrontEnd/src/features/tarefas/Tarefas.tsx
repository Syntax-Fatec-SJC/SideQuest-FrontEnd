import { useState, useEffect } from "react";
import Sidebar from "../../shared/components/Sidebar";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { FaCalendarAlt, FaRegUserCircle, FaTrash } from "react-icons/fa";
import ModalTarefa from "./Modal";
import { tarefaService } from "./TarefaService";
import { membrosService } from "../membros/MembrosService";
import type { Tarefa, MembroProjeto, Status } from "./type";

export default function Tarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [projetoId, setProjetoId] = useState<string | null>(() => localStorage.getItem('projetoSelecionadoId'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editarTarefa, setEditarTarefa] = useState<Tarefa | null>(null);
    const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [membros, setMembros] = useState<MembroProjeto[]>([]);

    // Carregar tarefas do backend
    // Ouve mudanças do projeto selecionado (outra página selecionou outro projeto)
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
            const data = await tarefaService.listarTarefasDoProjeto(pid);
            setTarefas((data as Tarefa[]) || []);
        } catch (error: unknown) {
            console.error("Erro ao carregar tarefas:", error);
            const mensagem = error instanceof Error ? error.message : String(error);
            setError(mensagem || 'Falha ao carregar');
        } finally {
            setLoading(false);
        }
    }

    async function carregarMembros(pid: string) {
        try {
            const lista = await membrosService.listarMembrosProjeto(pid);
            setMembros(lista || []);
        } catch (e: unknown) {
            console.error('Erro ao carregar membros do projeto', e);
            setMembros([]);
        }
    }

    function formatarData(data: string | null | undefined) {
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

    async function handleSave(data: {
        name: string;
        description: string;
        responsible: string[];
        endDate: string;
        status: Status;
        comment: string;
    }) {
        if (!projetoId) return;
        const tarefaPayload = {
            nome: data.name,
            descricao: data.description,
            status: data.status,
            comentario: data.comment,
            prazoFinal: data.endDate ? new Date(data.endDate).toISOString() : null,
            projetoId: projetoId,
            usuarioIds: data.responsible
        };
        try {
            if (editarTarefa) {
                await tarefaService.atualizarTarefa(editarTarefa.id as string, tarefaPayload as Tarefa);
            } else {
                await tarefaService.criarTarefa(tarefaPayload as Tarefa);
            }
            if (projetoId) await carregarTarefas(projetoId);
            setIsModalOpen(false);
            setEditarTarefa(null);
        } catch (error: unknown) {
            console.error("Erro ao salvar tarefa:", error);
        }
    }

    async function handleDelete(tarefaId: string) {
        try {
            await tarefaService.excluirTarefa(tarefaId);
            if (projetoId) await carregarTarefas(projetoId);
        } catch (error: unknown) {
            console.error("Erro ao excluir:", error);
        }
        setIsModalOpen(false);
        setEditarTarefa(null);
        setConfirmandoExclusaoId(null);
    }

    function iniciarExclusao(e: React.MouseEvent, tarefaId: string) {
        e.stopPropagation();
        if (confirmandoExclusaoId === tarefaId) {
            handleDelete(tarefaId);
        } else {
            setConfirmandoExclusaoId(tarefaId);
            setTimeout(() => {
                setConfirmandoExclusaoId((curr) => (curr === tarefaId ? null : curr));
            }, 4000);
        }
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
            await tarefaService.atualizarTarefa(draggableId, {
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
                <div className="flex-1 bg-white rounded-3xl  p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar">
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
                                            <Draggable key={tarefa.id!} draggableId={tarefa.id!} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`p-3 m-2 bg-white rounded-xl shadow cursor-pointer transition relative ${snapshot.isDragging ? "bg-blue-200" : "hover:bg-gray-50"
                                                            }`}
                                                        onClick={() => handleOpenEdit(tarefa)}
                                                    >
                                                        <button
                                                            onClick={(e) => iniciarExclusao(e, tarefa.id!)}
                                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1"
                                                        >
                                                            {confirmandoExclusaoId === tarefa.id ? 'Confirmar' : <FaTrash size={12} />}
                                                        </button>
                                                        {confirmandoExclusaoId === tarefa.id && (
                                                            <button onClick={cancelarExclusao} className="absolute top-2 right-16 text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
                                                        )}

                                                        <div className="flex flex-col justify-between">
                                                            <div className="flex flex-col justify-center gap-2 pr-6">
                                                                <span className="text-lg">{tarefa.nome}</span>
                                                                <p>{tarefa.descricao}</p>
                                                                {tarefa.comentario && (
                                                                    <p className="text-sm text-gray-600 italic">"{tarefa.comentario}"</p>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-between mt-7">
                                                                <p className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <FaRegUserCircle />
                                                                    {(() => {
                                                                        const ids = tarefa.usuarioIds || [];
                                                                        if (ids.length === 0) return 'Sem responsável';
                                                                        const nomes = ids
                                                                            .map(id => membros.find(m => m.usuarioId === id)?.nome || id)
                                                                            .filter(Boolean);
                                                                        if (nomes.length <= 2) return nomes.join(', ');
                                                                        return nomes.slice(0,2).join(', ') + ` (+${nomes.length-2})`;
                                                                    })()}
                                                                </p>
                                                                <p className="flex items-center gap-1">
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
                membrosProjeto={membros.map(m => ({ id: m.usuarioId, nome: m.nome, email: m.email }))}
                initialData={editarTarefa ? {
                    id: editarTarefa.id!,
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