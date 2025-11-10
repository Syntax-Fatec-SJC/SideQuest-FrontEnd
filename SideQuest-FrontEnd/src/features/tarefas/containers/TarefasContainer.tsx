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


  return (
    <TarefasView
      tarefas={tarefas}
      membros={membrosUI}
      onDragEnd={onDragEnd as (result: DropResult<string>) => Promise<void>}
      onOpenCreate={() => setIsModalOpen(true)}
      onOpenEdit={(tarefa) => {
        setEditarTarefa(tarefa);
        setIsModalOpen(true);
      }}
      onSave={(data) => handleSave(editarTarefa?.id ?? null, data)}
      onDelete={async (id) => {
        await handleDelete(id);
        setEditarTarefa(null);
        setIsModalOpen(false);
      }}
      editarTarefa={editarTarefa}
      isModalOpen={isModalOpen}
      onCloseModal={() => setIsModalOpen(false)}
    />
  );
}
