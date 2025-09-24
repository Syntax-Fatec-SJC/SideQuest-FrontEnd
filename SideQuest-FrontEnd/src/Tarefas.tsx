import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { FaCalendarAlt, FaRegUserCircle, FaTrash } from "react-icons/fa";
import ModalTarefa from "./components/Modal";

type Status = "Pendente" | "Desenvolvimento" | "Concluído"

// Interface usando EXATAMENTE os campos do backend Spring Boot
interface Tarefa {
    id: string;
    nome: string;
    status: string;
    descricao: string;
    comentario?: string;
    prazoFinal?: string;
    projetoId?: string;
    anexo?: string[];
    usuariosIds?: string[];
}

const API_URL = 'http://localhost:8080';

export default function Tarefas() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editarTarefa, setEditarTarefa] = useState<Tarefa | null>(null);

    // Carregar tarefas do backend
    useEffect(() => {
        carregarTarefas();
    }, []);

    async function carregarTarefas() {
        try {
            const response = await fetch(`${API_URL}/listar/tarefas`);
            if (response.ok) {
                const data: Tarefa[] = await response.json();
                setTarefas(data);
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
        }
    }

    function formatarData(data: string | undefined) {
        if (!data) return "";
        const date = new Date(data);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = date.getMonth();
        const ano = date.getFullYear();
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
        // Dados no formato exato do backend Spring Boot
        const tarefaData = {
            nome: data.name,
            descricao: data.description,
            status: data.status,
            comentario: data.comment,
            prazoFinal: data.endDate ? new Date(data.endDate).toISOString() : null,
            projetoId: null,
            usuariosIds: data.responsible
        };

        try {
            let response;
            if (editarTarefa) {
                // Atualizar tarefa
                response = await fetch(`${API_URL}/atualizar/tarefas/${editarTarefa.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...tarefaData, id: editarTarefa.id })
                });
            } else {
                // Criar nova tarefa
                response = await fetch(`${API_URL}/cadastrar/tarefas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tarefaData)
                });
            }

            if (response.ok) {
                await carregarTarefas();
                setIsModalOpen(false);
                setEditarTarefa(null);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    }

    async function handleDelete(tarefaId: string) {
        try {
            await fetch(`${API_URL}/excluir/tarefas/${tarefaId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tarefaId })
            });
            await carregarTarefas();
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
        setIsModalOpen(false);
        setEditarTarefa(null);
    }

    async function handleDeleteDirect(tarefaId: string, event: React.MouseEvent) {
        event.stopPropagation();
        if (window.confirm('Excluir esta tarefa?')) {
            await handleDelete(tarefaId);
        }
    }

    async function onDragEnd(result: DropResult) {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const novoStatus = destination.droppableId as Status;
        const tarefa = tarefas.find(t => t.id === draggableId);

        if (!tarefa) return;

        try {
            await fetch(`${API_URL}/atualizar/tarefas/${draggableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...tarefa, status: novoStatus })
            });

            setTarefas((prev) =>
                prev.map((t) =>
                    t.id === draggableId ? { ...t, status: novoStatus } : t
                )
            );
        } catch (error) {
            console.error('Erro ao mover tarefa:', error);
        }
    }

    const columns = [
        { id: "Pendente", nome: "Pendentes", color: "text-yellow-700" },
        { id: "Desenvolvimento", nome: "Desenvolvimento", color: "text-gray-500" },
        { id: "Concluído", nome: "Concluído", color: "text-green-700" }
    ];

    return (
        <div className="flex h-screen relative">
            <Sidebar />

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 bg-white rounded-3xl overflow-auto p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar">
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
                                                        <button
                                                            onClick={(e) => handleDeleteDirect(tarefa.id, e)}
                                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>

                                                        <div className="flex flex-col justify-between">
                                                            <div className="flex flex-col justify-center gap-2 pr-6">
                                                                <span className="text-lg">{tarefa.nome}</span>
                                                                <p>{tarefa.descricao}</p>
                                                                {tarefa.comentario && (
                                                                    <p className="text-sm text-gray-600 italic">"{tarefa.comentario}"</p>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-between mt-7">
                                                                <p className="flex items-center gap-1">
                                                                    <FaRegUserCircle />
                                                                    {tarefa.usuariosIds?.join(", ") || "Sem responsável"}
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
                initialData={editarTarefa ? {
                    id: editarTarefa.id,
                    name: editarTarefa.nome || "",
                    description: editarTarefa.descricao || "",
                    responsible: editarTarefa.usuariosIds || [],
                    endDate: editarTarefa.prazoFinal ? editarTarefa.prazoFinal.split('T')[0] : "",
                    status: editarTarefa.status as Status,
                    comment: editarTarefa.comentario || "",
                } : undefined}
            />
        </div>
    )
}