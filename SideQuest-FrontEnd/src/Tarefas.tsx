import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { FaCalendarAlt, FaRegUserCircle } from "react-icons/fa";
import ModalTarefa from "./components/Modal";

type Status = "Pendente" | "Desenvolvimento" | "Concluído"

interface Tarefa {
    id: string;
    nome: string;
    status: string;
    descricao: string;
    comentarios?: string;
    prazo: string;
    responsavel: string;
}

export default function Tarefas(){

    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editarTarefa, setEditarTarefa] = useState<Tarefa | null>(null);

    function handleOpenCreate(){
        setEditarTarefa(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(tarefa: Tarefa){
        setEditarTarefa(tarefa);
        setIsModalOpen(true);
    }

    function formatarData(data: string | undefined) {
        if (!data) return "";
        const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        const [ano, mes, dia] = data.split("-");
        if (!ano || !mes || !dia) return data; 
        return `${dia} ${meses[parseInt(mes,10) - 1]} ${ano}`
    }

    function handleSave(data: {
        name: string;
        description: string;
        responsible: string[];
        endDate: string;
        status: Status;
        comment: string;
    }) {
        if (editarTarefa) {
            setTarefas((prev) => 
                prev.map((t) => 
                    t.id === editarTarefa.id
                    ? {
                        ...t,
                        nome: data.name,
                        descricao: data.description,
                        status: data.status,
                        comentarios: data.comment,
                        prazo: data.endDate,
                        responsavel: data.responsible.join(",")
                    }
                    : t
                )
            );
        } else {
            const novaTarefa: Tarefa = {
                id: Date.now().toString(),
                nome: data.name,
                descricao: data.description,
                status: data.status,
                comentarios: data.comment,
                prazo: data.endDate,
                responsavel: data.responsible.join(",")
            };
            setTarefas((prev) => [...prev, novaTarefa]);
        }
        setIsModalOpen(false);
        setEditarTarefa(null);
    }

    function handleDelete(tarefaId: string) {
        setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== tarefaId));
        setIsModalOpen(false); 
        setEditarTarefa(null); 
    }

    function onDragEnd(result: DropResult) {
        if (!result.destination) return;

        const {draggableId, destination} = result;

        setTarefas((prev) =>
            prev.map((tarefa) => 
                tarefa.id === draggableId
                ? {...tarefa, status: destination.droppableId as Status}
                : tarefa
            )
        )
    } 

    const columns: {id: Status; nome: string, color: string}[] = [
        {id: "Pendente", nome: "Pendentes", color: "text-yellow-700"},
        {id: "Desenvolvimento", nome: "Desenvolvimento", color: "text-gray-500"},
        {id: "Concluído", nome: "Concluído", color: "text-green-700"}
    ]

    return (
        <div className="flex gap-5">
            <Sidebar />

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex flex-col items-center w-[1245px] h-[calc(100vh-4rem)] bg-white mt-8 mb-8 p-4 rounded-3xl">
                    <div className="flex flex-row justify-center gap-10 w-full flex-1">
                        {columns.map((col) => (
                            <Droppable key={col.id} droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex flex-col flex-1 bg-[#F2EEE9] rounded-xl shadow-2xl  transition-colors overflow-y-auto max-h-[calc(100vh-10rem)] min-h-[calc(100vh-10rem)]
                                            ${snapshot.isDraggingOver ? "bg-blue-100" : ""}
                                            `}
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
                                                        className={`p-3 m-2 bg-white rounded-xl shadow cursor-pointer transition ${
                                                            snapshot.isDragging ? "bg-blue-200" : "hover:bg-gray-50"
                                                        }`}
                                                        onClick={() => handleOpenEdit(tarefa)}
                                                    >
                                                        <div className="flex flex-col justify-between">
                                                            <div className="flex flex-col justify-center gap-2">
                                                                <span className="text-lg">{tarefa.nome}</span>
                                                                <p>{tarefa.descricao}</p>
                                                            </div>
                                                            <div className="flex justify-between mt-7">
                                                                <p className="flex items-center gap-1"><FaRegUserCircle />{tarefa.responsavel}</p>
                                                                <p className="flex items-center gap-1">{formatarData(tarefa.prazo)}<FaCalendarAlt /></p>
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
                        className="flex items-center justify-center bg-[#377CD4] w-full h-16 rounded-lg cursor-pointer mt-4"
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
                initialData = {
                    editarTarefa
                        ? {
                            id: editarTarefa.id,
                            name: editarTarefa.nome || "",
                            description: editarTarefa.descricao || "",
                            responsible: editarTarefa.responsavel ? editarTarefa.responsavel.split(",") : [],
                            endDate: editarTarefa.prazo,
                            status: editarTarefa.status as Status,
                            comment: editarTarefa.comentarios || "",                    
                        }
                        : undefined
                }
            />
        </div>
    )
}