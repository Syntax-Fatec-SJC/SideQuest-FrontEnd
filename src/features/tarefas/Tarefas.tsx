import { useState, useEffect } from "react";
import Sidebar from "../../shared/components/Sidebar";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { FaCalendarAlt, FaRegUserCircle, FaTrash } from "react-icons/fa";
import ModalTarefa from "./Modal";
import { tarefaService } from "../../services/TarefaService";
import { anexoService } from "../../services/AnexoService";
import { usuarioService, type UsuarioSimples } from "../../services/UsuarioService";
import type { Tarefa } from "../../types/Tarefa";

type Status = "Pendente" | "Desenvolvimento" | "Concluído"

export default function Tarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [projetoId, setProjetoId] = useState<string | null>(() => localStorage.getItem('projetoSelecionadoId'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editarTarefa, setEditarTarefa] = useState<Tarefa | null>(null);
    const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usuarios, setUsuarios] = useState<UsuarioSimples[]>([]);

    // Carregar usuarios do sistema (uma vez só)
    useEffect(() => {
        carregarUsuarios();
    }, []);

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
        } else {
            setTarefas([]);
        }
    }, [projetoId]);

    async function carregarUsuarios() {
        try {
            const lista = await usuarioService.listarTodos();
            setUsuarios(lista || []);
            console.log('✓ Usuarios carregados:', lista.length, 'usuários');
        } catch (e) {
            console.error('✗ Erro ao carregar usuarios', e);
            setUsuarios([]);
        }
    }

    async function carregarTarefas(pid: string) {
        setLoading(true);
        setError(null);
        try {
            const data = await tarefaService.listarTarefasDoProjeto(pid);
            setTarefas(data || []);
            console.log('✓ Tarefas carregadas:', data.length, 'tarefas');
        } catch (error: any) {
            console.error("✗ Erro ao carregar tarefas:", error);
            setError(error?.message || 'Falha ao carregar');
        } finally {
            setLoading(false);
        }
    }

    function formatarData(data: string | null | undefined): string {
        // Trata null, undefined e strings vazias
        if (!data || data === null || data === undefined || data === '') {
            return "";
        }

        try {
            const date = new Date(data);
            const dia = String(date.getUTCDate()).padStart(2, '0');
            const mes = date.getUTCMonth();
            const ano = date.getUTCFullYear();
            const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
            return `${dia} ${meses[mes]} ${ano}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return "";
        }
    }

    function handleOpenCreate() {
        setEditarTarefa(null);
        setIsModalOpen(true);
        console.log('✓ Abrindo modal para criar nova tarefa');
    }

    function handleOpenEdit(tarefa: Tarefa) {
        setEditarTarefa(tarefa);
        setIsModalOpen(true);
        console.log('✓ Abrindo modal para editar tarefa:', tarefa.nome);
    }

    async function handleSave(data: {
        name: string;
        description: string;
        responsible: string[];
        endDate: string;
        status: Status;
        comment: string;
        files: File[];
    }) {
        if (!projetoId) {
            alert('Nenhum projeto selecionado!');
            return;
        }

        const tarefaPayload: Tarefa = {
            id: editarTarefa?.id || '',
            nome: data.name,
            descricao: data.description,
            status: data.status,
            comentario: data.comment,
            prazoFinal: data.endDate ? new Date(data.endDate).toISOString() : undefined,
            projetoId: projetoId,
            usuarioIds: data.responsible
        };

        console.log('SALVANDO TAREFA:', tarefaPayload);
        console.log('Responsáveis:', data.responsible);
        console.log('Anexos novos:', data.files.length);

        try {
            let tarefaId: string;

            if (editarTarefa?.id) {
                const response = await tarefaService.atualizarTarefa(editarTarefa.id, tarefaPayload);
                tarefaId = editarTarefa.id;
                console.log('✓ Tarefa atualizada no MongoDB:', response);
            } else {
                const response = await tarefaService.criarTarefa(tarefaPayload);
                tarefaId = response.id || '';
                console.log('✓ Tarefa criada no MongoDB:', response);
            }

            // Upload de anexos NOVOS
            if (data.files && data.files.length > 0 && tarefaId) {
                console.log('Fazendo upload de', data.files.length, 'anexos...');
                await anexoService.upload(tarefaId, data.files);
                console.log('✓ Anexos salvos no MongoDB!');
            }

            // Recarregar tarefas para mostrar atualizado
            await carregarTarefas(projetoId);

            setIsModalOpen(false);
            setEditarTarefa(null);

            alert('✓ Tarefa salva com sucesso!');
        } catch (error) {
            console.error("✗ Erro ao salvar tarefa:", error);
            alert("Erro ao salvar tarefa. Verifique o console para detalhes.");
        }
    }

    async function handleDelete(tarefaId: string) {
        try {
            console.log('Deletando anexos da tarefa', tarefaId);
            await anexoService.deletarPorTarefa(tarefaId);

            console.log('Deletando tarefa', tarefaId);
            await tarefaService.excluirTarefa(tarefaId);

            if (projetoId) {
                await carregarTarefas(projetoId);
            }

            console.log('✓ Tarefa deletada com sucesso!');
            alert('✓ Tarefa deletada com sucesso!');
        } catch (error) {
            console.error("✗ Erro ao excluir tarefa:", error);
            alert("Erro ao excluir tarefa. Tente novamente.");
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

        if (!tarefa || tarefa.status === novoStatus || !tarefa.id) return;

        try {
            const payload: Tarefa = {
                ...tarefa,
                status: novoStatus
            };

            await tarefaService.atualizarTarefa(tarefa.id, payload);
            setTarefas(prev => prev.map(t => t.id === draggableId ? { ...t, status: novoStatus } : t));

            console.log(`✓ Tarefa movida para ${novoStatus} no MongoDB!`);
        } catch (error) {
            console.error("✗ Erro ao mover tarefa:", error);
            alert("Erro ao mover tarefa. Recarregando...");
            if (projetoId) carregarTarefas(projetoId);
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
                <div className="flex-1 bg-white rounded-3xl p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar">
                    <div className="flex flex-row justify-center gap-10 w-full flex-1">
                        {columns.map((col) => (
                            <Droppable key={col.id} droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex flex-col flex-1 bg-[#F2EEE9] rounded-xl shadow-2xl transition-all duration-300 overflow-y-auto max-h-[calc(94vh-10rem)] min-h-[calc(94vh-10rem)]
                                            ${snapshot.isDraggingOver ? "bg-blue-100 border-4 border-blue-400 border-dashed" : ""}`}
                                    >
                                        <h5 className={`flex justify-center mb-4 text-2xl font-mono sticky top-0 z-10 bg-[#F2EEE9] py-2 ${col.color}`}>
                                            {col.nome}
                                        </h5>
                                        {renderConteudoColuna(col.id)}
                                        {tarefas.filter((t) => t.status === col.id).map((tarefa, index) => {
                                            if (!tarefa.id) return null;
                                            return (
                                                <Draggable key={tarefa.id} draggableId={tarefa.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`p-3 m-2 bg-white rounded-xl shadow cursor-grab active:cursor-grabbing transition relative ${snapshot.isDragging ? "bg-blue-200 shadow-2xl scale-105 rotate-2" : "hover:bg-gray-50"
                                                                }`}
                                                            onClick={() => {
                                                                if (!snapshot.isDragging) {
                                                                    handleOpenEdit(tarefa);
                                                                }
                                                            }}
                                                        >
                                                            {/* BOTOES DE EXCLUSAO - VERTICAIS E BONITOS */}
                                                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                                                {confirmandoExclusaoId === tarefa.id ? (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => iniciarExclusao(e, tarefa.id!)}
                                                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 animate-bounce"
                                                                            title="Confirmar exclusão"
                                                                        >
                                                                            Confirmar
                                                                        </button>
                                                                        <button
                                                                            onClick={cancelarExclusao}
                                                                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                                                                            title="Cancelar exclusão"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => iniciarExclusao(e, tarefa.id!)}
                                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-200 transform hover:scale-125 hover:rotate-12"
                                                                        title="Excluir tarefa"
                                                                    >
                                                                        <FaTrash size={14} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col justify-between">
                                                                <div className="flex flex-col justify-center gap-2 pr-6">
                                                                    <span className="text-lg font-semibold text-gray-800">{tarefa.nome}</span>
                                                                    <p className="text-sm text-gray-600">{tarefa.descricao}</p>
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
                                                                                .map(id => {
                                                                                    const usuario = usuarios.find(u => u.id === id);
                                                                                    return usuario?.nome || null;
                                                                                })
                                                                                .filter((nome): nome is string => nome !== null);

                                                                            if (nomes.length === 0) return 'Sem responsável';
                                                                            if (nomes.length <= 2) return nomes.join(', ');
                                                                            return nomes.slice(0, 2).join(', ') + ` (+${nomes.length - 2})`;
                                                                        })()}
                                                                    </p>
                                                                    <p className="flex items-center gap-1 text-xs text-gray-500">
                                                                        {formatarData(tarefa.prazoFinal)}
                                                                        <FaCalendarAlt />
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                    <div
                        className="flex items-center justify-center bg-[#377CD4] w-full h-16 rounded-lg cursor-pointer mt-4 hover:bg-[#2a5fa0] transition-colors shadow-lg"
                        onClick={handleOpenCreate}
                    >
                        <h5 className="text-3xl text-white font-mono">Criar Tarefa</h5>
                    </div>
                </div>
            </DragDropContext>

            <ModalTarefa
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditarTarefa(null);
                }}
                onSave={handleSave}
                onDelete={handleDelete}
                membrosProjeto={usuarios.map(u => ({ id: u.id, nome: u.nome, email: u.email }))}
                initialData={editarTarefa && editarTarefa.id ? {
                    id: editarTarefa.id,
                    name: editarTarefa.nome || "",
                    description: editarTarefa.descricao || "",
                    responsible: editarTarefa.usuarioIds || [],
                    endDate: (editarTarefa.prazoFinal && editarTarefa.prazoFinal !== null)
                        ? editarTarefa.prazoFinal.split('T')[0]
                        : "",
                    status: editarTarefa.status as Status,
                    comment: editarTarefa.comentario || "",
                } : undefined}
            />
        </div>
    )
}