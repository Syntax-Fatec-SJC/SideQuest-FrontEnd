import { useState, useMemo } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import type { Tarefa } from "../../../types/Tarefa";
import { useAuth } from "../../../shared/hooks/useAuth";
import { ConexaoPage } from "../../../shared/components/ConexaoPage";
import { useTarefas } from "../hooks/useTarefas";
import { TarefasView } from "../components/TarefasView";

export function TarefasContainer() {
  const { usuario } = useAuth();
  const { tarefas, membros, onDragEnd, handleSave, handleDelete, error, carregarDados } =
    useTarefas(usuario);

  const [editarTarefa, setEditarTarefa] = useState<Tarefa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const membrosUI = useMemo(
    () =>
      membros.map((m) => ({
        id: m.usuarioId,
        nome: m.nome,
        email: m.email,
      })),
    [membros]
  );

  const erroServidor = error && tarefas.length === 0 && membros.length === 0;

  if (erroServidor) {
    return (
      <ConexaoPage
        erroMensagem={error?.message}
        onTentarNovamente={carregarDados}
      />
    );
  }

  const handleOpenCreate = () => {
    setEditarTarefa(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tarefa: Tarefa) => {
    setEditarTarefa(tarefa);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditarTarefa(null);
    setIsModalOpen(false);
  };

  const handleSaveWithAnexos = async (
    data: {
      name: string;
      description: string;
      responsible: string[];
      endDate: string;
      status: "Pendente" | "Desenvolvimento" | "Concluído";
      comment?: string;
    },
    uploadAnexosFn?: (tarefaId: string) => Promise<any>,
    deleteAnexosFn?: () => Promise<void>
  ) => {
    await handleSave(
      editarTarefa?.id ?? null,
      data,
      () => {
        setEditarTarefa(null);
        setIsModalOpen(false);
      },
      uploadAnexosFn,
      deleteAnexosFn
    );
  };

  const handleDeleteTarefa = async (id: string) => {
    await handleDelete(id);
    setEditarTarefa(null);
    setIsModalOpen(false);
  };

  return (
    <TarefasView
      tarefas={tarefas}
      membros={membrosUI}
      onDragEnd={onDragEnd as (result: DropResult<string>) => Promise<void>}
      onOpenCreate={handleOpenCreate}
      onOpenEdit={handleOpenEdit}
      onSave={handleSaveWithAnexos}
      onDelete={handleDeleteTarefa}
      editarTarefa={editarTarefa}
      isModalOpen={isModalOpen}
      onCloseModal={handleCloseModal}
    />
  );
}
