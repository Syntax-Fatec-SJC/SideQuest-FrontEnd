import { useState } from "react";
import Sidebar from "../../../shared/components/Sidebar";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { FaCalendarAlt, FaRegUserCircle } from "react-icons/fa";
import ModalTarefa from "../components/TarefaModal";
import type { Tarefa, Status } from "../../../types/Tarefa";

interface TarefasViewProps {
  tarefas: Tarefa[];
  membros: { id: string; nome: string; email: string }[];
  onDragEnd: (result: DropResult) => void;
  onOpenCreate: () => void;
  onOpenEdit: (tarefa: Tarefa) => void;
  onSave: (data: {
    name: string;
    description: string;
    responsible: string[];
    endDate: string;
    status: Status;
    comment?: string;
  }) => void;
  onDelete: (id: string) => void;
  editarTarefa?: Tarefa | null;
  isModalOpen: boolean;
  onCloseModal: () => void;
}

export function TarefasView({
  tarefas,
  membros,
  onDragEnd,
  onOpenCreate,
  onOpenEdit,
  onSave,
  onDelete,
  editarTarefa,
  isModalOpen,
  onCloseModal,
}: TarefasViewProps) {
  const [colunaSelecionada, setColunaSelecionada] = useState("Pendente");

  const columns = [
    { id: "Pendente", nome: "Pendentes", color: "text-yellow-700" },
    { id: "Desenvolvimento", nome: "Desenvolvimento", color: "text-gray-500" },
    { id: "Concluído", nome: "Concluído", color: "text-green-700" },
  ];

  const formatarData = (data?: string | null) => {
    if (!data) return "";
    const date = new Date(data);
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return `${String(date.getUTCDate()).padStart(2, "0")} ${meses[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };

  const initialModalData = editarTarefa
    ? {
        id: editarTarefa.id!,
        name: editarTarefa.nome,
        description: editarTarefa.descricao || "",
        responsible: editarTarefa.usuarioIds || [],
        endDate: editarTarefa.prazoFinal ? editarTarefa.prazoFinal.split("T")[0] : "",
        status: editarTarefa.status as Status,
        comment: editarTarefa.comentario || "",
      }
    : undefined;

  return (
    <div className="flex h-screen relative overflow-hidden">
      <Sidebar />

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">
            TAREFAS DO PROJETO
          </h1>

          {/* Select + botão para mobile */}
          <div className="md:hidden mb-4 flex items-center gap-2">
            <select
              value={colunaSelecionada}
              onChange={e => setColunaSelecionada(e.target.value)}
              className="flex-1 p-2 rounded border border-gray-300"
            >
              {columns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1 bg-[#377CD4] text-white p-2 rounded-lg hover:bg-[#2a5fa0] transition-colors"
            >
              <span className="text-xl font-bold">+</span>
              <span className="text-sm font-mono">Criar</span>
            </button>
          </div>

          {/* Container das colunas */}
          <div className="flex flex-col md:flex-row justify-center gap-4 w-full flex-1">
            {columns.map(col => {
              if (window.innerWidth < 768 && colunaSelecionada !== col.id) return null;

              return (
                <Droppable key={col.id} droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col flex-1 bg-[#F2EEE9] rounded-xl shadow-2xl overflow-y-auto max-h-[calc(94vh-12rem)] min-h-[calc(94vh-12rem)]
                        transition-colors ${snapshot.isDraggingOver ? "bg-blue-100" : ""}`}
                    >
                      <h5 className={`flex justify-center mb-4 text-2xl font-mono sticky top-0 z-10 bg-[#F2EEE9] py-2 ${col.color}`}>
                        {col.nome}
                      </h5>

                      {tarefas.filter(t => t.status === col.id).length === 0 && (
                        <p className="text-sm italic text-gray-400 px-3 py-2">Nenhuma tarefa</p>
                      )}

                      {tarefas
                        .filter(t => t.status === col.id)
                        .map((tarefa, index) => (
                          <Draggable key={tarefa.id!} draggableId={tarefa.id!} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 m-2 bg-white rounded-xl shadow cursor-pointer transition relative ${
                                  snapshot.isDragging ? "bg-blue-200" : "hover:bg-gray-50"
                                }`}
                                onClick={() => onOpenEdit(tarefa)}
                              >
                                <div className="flex flex-col justify-between">
                                  <div className="flex flex-col justify-center gap-2 pr-6">
                                    <span className="text-lg">{tarefa.nome}</span>
                                    <p className="text-sm text-gray-700">{tarefa.descricao}</p>
                                  </div>
                                  <div className="flex justify-between mt-7">
                                    <p className="flex items-center gap-1 text-xs text-gray-600">
                                      <FaRegUserCircle />
                                      {(() => {
                                        const ids = tarefa.usuarioIds || [];
                                        const nomes = ids
                                          .map(id => membros.find(m => m.id === id)?.nome || id)
                                          .filter(Boolean);
                                        if (nomes.length === 0) return "Sem responsável";
                                        if (nomes.length <= 2) return nomes.join(", ");
                                        return nomes.slice(0, 2).join(", ") + ` (+${nomes.length - 2})`;
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
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>

          {/* Botão de criar no desktop */}
          <div className="hidden md:flex items-center justify-center bg-[#377CD4] w-full h-16 rounded-lg cursor-pointer mt-4 hover:bg-[#2a5fa0] transition-colors"
            onClick={onOpenCreate}
          >
            <h5 className="text-3xl text-white font-mono">Criar Tarefa</h5>
          </div>
        </main>
      </DragDropContext>

      <ModalTarefa
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSave={data => {
          onSave(data);
          onCloseModal();
        }}
        onDelete={onDelete}
        membrosProjeto={membros.map(m => ({ usuarioId: m.id, nome: m.nome, email: m.email, criador: false }))}
        initialData={initialModalData}
      />
    </div>
  );
}
