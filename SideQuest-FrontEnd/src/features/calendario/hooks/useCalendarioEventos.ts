import { useEffect, useState, useCallback } from "react";
import type { EventInput } from "@fullcalendar/core";
import { tarefaService } from "../../../services/TarefaService";
import type { Tarefa } from "../../../types/Tarefa";
import type { UsuarioSessao } from "../../../shared/hooks/useAuth";
import { useToast } from "../../../shared/hooks/useToast";
import { tratarErro } from "../../../shared/errors/index";
import { mensagensErro } from "../utils/mensagensCalendario";
import type { ApiError } from "../../../shared/errors/ApiError";

export function useCalendarioEventos(
  projetoSelecionadoId: string | null,
  apenasMinhasTarefas: boolean,
  usuario?: UsuarioSessao | null
) {
  const [eventos, setEventos] = useState<EventInput[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<ApiError | null>(null);
  const { show } = useToast();

  const carregarDados = useCallback(async () => {
    if (!projetoSelecionadoId) {
      setEventos([]);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      let tarefas: Tarefa[] = await tarefaService.listarTarefasDoProjeto(projetoSelecionadoId);

      if (apenasMinhasTarefas && usuario) {
        tarefas = tarefas.filter((t) => t.usuarioIds?.includes(String(usuario.id)));
      }

      const formatadas: EventInput[] = tarefas
        .filter((t) => t.prazoFinal)
        .map((t) => ({
          id: t.id,
          title: t.nome,
          start: t.prazoFinal?.split("T")[0] ?? "",
          color: t.status === "Concluído" ? "#22C55E" : "#FACC15",
          allDay: true,
        }));

      setEventos(formatadas);
    } catch (e: unknown) {
      const apiErro = tratarErro(e);
      setErro(apiErro);
      setEventos([]);
      show({ tipo: "erro", mensagem: apiErro.message || mensagensErro.carregarTarefas });
    } finally {
      setCarregando(false);
    }
  }, [projetoSelecionadoId, apenasMinhasTarefas, usuario, show]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  return { eventos, carregando, erro, carregarDados };
}
