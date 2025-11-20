import { useState, useCallback, useEffect } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { tarefaService } from "../../../services/TarefaService";
import { membrosService } from "../../../services/MembrosService";
import { useToast } from "../../../shared/hooks/useToast";
import type { Tarefa, Status } from "../../../types/Tarefa";
import type { UsuarioSessao } from "../../../shared/hooks/useAuth";
import { tratarErro } from "../../../shared/errors/index";
import type { ApiError } from "../../../shared/errors/ApiError";

interface TarefaPayload {
  name: string;
  description: string;
  status: Status;
  endDate?: string | Date | null;
  responsible?: string[];
}

export function useTarefas(usuario: UsuarioSessao | null) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [membros, setMembros] = useState<{ usuarioId: string; nome: string; email: string; criador: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { show } = useToast();

  const carregarDados = useCallback(async () => {
    const projetoId = localStorage.getItem("projetoSelecionadoId");
    if (!projetoId) {
      setTarefas([]);
      setMembros([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tarefasData = await tarefaService.listarTarefasDoProjeto(projetoId);
      setTarefas(tarefasData || []);
    } catch (e: unknown) {
      const erro = tratarErro(e);
      setError(erro);
      setTarefas([]);
      console.error("Erro ao carregar tarefas:", erro);
    }

    try {
      const membrosData = await membrosService.listarMembrosProjeto(projetoId);
      setMembros(membrosData || []);
    } catch (e: unknown) {
      const erro = tratarErro(e);
      setError(erro);
      setMembros([]);
      console.error("Erro ao carregar membros:", erro);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario, carregarDados]);

  const handleSave = useCallback(
    async (tarefaId: string | null, data: TarefaPayload, onSuccess?: () => void) => {
      const projetoId = localStorage.getItem("projetoSelecionadoId");
      if (!projetoId || !usuario) return;

      const payload = {
        nome: data.name,
        descricao: data.description,
        status: data.status,
        prazoFinal: data.endDate ? new Date(data.endDate).toISOString() : null,
        projetoId,
        usuarioIds: data.responsible?.length ? data.responsible : [usuario.id],
      };

      try {
        if (tarefaId) await tarefaService.atualizarTarefa(tarefaId, payload);
        else await tarefaService.criarTarefa(payload);

        const tarefasData = await tarefaService.listarTarefasDoProjeto(projetoId);
        setTarefas(tarefasData || []);

        onSuccess?.();
      } catch (e: unknown) {
        const erro = tratarErro(e);
        setError(erro);
        
        // Sempre exibir o erro em um toast para o usuário
        show({ tipo: "erro", mensagem: erro.message });
      }
    },
    [usuario, show]
  );

  const handleDelete = useCallback(
    async (tarefaId: string, onSuccess?: () => void) => {
      const projetoId = localStorage.getItem("projetoSelecionadoId");
      if (!projetoId) return;

      try {
        await tarefaService.excluirTarefa(tarefaId);
        const tarefasData = await tarefaService.listarTarefasDoProjeto(projetoId);
        setTarefas(tarefasData || []);
        onSuccess?.();
      } catch (e: unknown) {
        const erro = tratarErro(e);
        setError(erro);
        
        // Sempre exibir o erro em um toast para o usuário
        show({ tipo: "erro", mensagem: erro.message });
      }
    },
    [show]
  );

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const projetoId = localStorage.getItem("projetoSelecionadoId");
      if (!projetoId || !result.destination || !usuario) return;

      const { draggableId, destination } = result;
      const novoStatus = destination.droppableId as Status;
      const tarefa = tarefas.find((t) => t.id === draggableId);
      if (!tarefa || tarefa.status === novoStatus) return;

      try {
        await tarefaService.atualizarTarefa(draggableId, {
          nome: tarefa.nome,
          descricao: tarefa.descricao,
          status: novoStatus,
          prazoFinal: tarefa.prazoFinal || null,
          projetoId: tarefa.projetoId || projetoId,
          usuarioIds: tarefa.usuarioIds || [],
        });
        setTarefas((prev) =>
          prev.map((t) => (t.id === draggableId ? { ...t, status: novoStatus } : t))
        );
      } catch (e: unknown) {
        const erro = tratarErro(e);
        setError(erro);
        
        // Sempre exibir o erro em um toast para o usuário
        show({ tipo: "erro", mensagem: erro.message });
      }
    },
    [tarefas, usuario, show]
  );

  return {
    tarefas,
    membros,
    loading,
    error,
    onDragEnd,
    handleSave,
    handleDelete,
    carregarDados,
  };
}
