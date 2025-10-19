import { useEffect, useState } from "react";
import { tarefaService } from "../../../services/TarefaService";
import { membrosService } from "../../../services/MembrosService";
import { useToast } from "../../../shared/hooks/useToast";
import { tratarErro } from "../../../shared/errors";
import { mensagensErro } from "../utils/mensagens";
import type { Tarefa } from "../../../types/Tarefa";
import type { MembroProjeto } from "../../../types/Membro";

export type TarefasMembro = {
  nome: string;
  tarefasConcluidas: number;
};

export function useTarefasPorMembro(projetoId: string, limiteTop = 3) {
  const { show } = useToast();
  const [dados, setDados] = useState<TarefasMembro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projetoId) return;

    async function carregarDados() {
      setLoading(true);
      try {
        const [membros, tarefas] = await Promise.all([
          membrosService.listarMembrosProjeto(projetoId),
          tarefaService.listarTarefasDoProjeto(projetoId),
        ]);

        // Filtra apenas tarefas concluídas
        const tarefasConcluidas = tarefas.filter(
          (t: Tarefa) => t.status === "Concluído"
        );

        // Conta quantas tarefas cada membro concluiu
        const resultado: TarefasMembro[] = membros.map((m: MembroProjeto) => {
          const quantidade = tarefasConcluidas.filter((t: Tarefa) =>
            t.usuarioIds?.includes(m.usuarioId)
          ).length;

          return {
            nome: m.nome,
            tarefasConcluidas: quantidade,
          };
        });

        // Ordena do maior pro menor e pega só os top 3
        const topMembros = resultado
          .filter((m) => m.tarefasConcluidas > 0)
          .sort((a, b) => b.tarefasConcluidas - a.tarefasConcluidas)
          .slice(0, limiteTop);

        setDados(topMembros);
      } catch (e: unknown) {
        const erro = tratarErro(e);
        const mensagemErro = erro.message || mensagensErro.carregarMembros;
        setDados([]);
        show({ tipo: 'erro', mensagem: mensagemErro });
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [projetoId, limiteTop, show]);

  return { dados, loading };
}