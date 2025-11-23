import { useEffect, useState, useRef, useCallback } from "react";
import { tarefaService } from "../../../services/TarefaService";
import { membrosService } from "../../../services/MembrosService";
import { useToast } from "../../../shared/hooks/useToast";
import { tratarErro } from "../../../shared/errors/index";
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
  const [erro, setErro] = useState<string | null>(null);

  const ultimoErroRef = useRef<string | null>(null);
  const canceladoRef = useRef(false);

  const recarregar = useCallback(async () => {
    if (!projetoId) {
      setDados([]);
      setLoading(false);
      setErro(null);
      return;
    }

    canceladoRef.current = false;
    setLoading(true);
    setErro(null);

    try {
      const [membros, tarefas] = await Promise.all([
        membrosService.listarMembrosProjeto(projetoId),
        tarefaService.listarTarefasDoProjeto(projetoId),
      ]);

      if (canceladoRef.current) return;

      const tarefasConcluidas = tarefas.filter((t: Tarefa) => t.status === "Concluído");

      const resultado: TarefasMembro[] = membros.map((m: MembroProjeto) => ({
        nome: m.nome,
        tarefasConcluidas: tarefasConcluidas.filter((t) =>
          t.usuarioIds?.includes(m.usuarioId)
        ).length,
      }));

      const topMembros = resultado
        .filter((m) => m.tarefasConcluidas > 0)
        .sort((a, b) => b.tarefasConcluidas - a.tarefasConcluidas)
        .slice(0, limiteTop);

      setDados(topMembros);
      setErro(null);
      ultimoErroRef.current = null;
    } catch (e: unknown) {
      if (canceladoRef.current) return;

      const erroObj = tratarErro(e);
      const mensagemErro = erroObj.message || mensagensErro.carregarMembros;

      setDados([]);
      setErro(mensagemErro);

      const isConectividadeError =
        mensagemErro.toLowerCase().includes("conectividade") ||
        mensagemErro.toLowerCase().includes("conexão");

      // Só mostra toast se não for erro de conectividade
      if (!isConectividadeError && ultimoErroRef.current !== mensagemErro) {
        show({ tipo: "erro", mensagem: mensagemErro });
        ultimoErroRef.current = mensagemErro;
      }
    } finally {
      if (!canceladoRef.current) setLoading(false);
    }
  }, [projetoId, limiteTop, show]);

  useEffect(() => {
    recarregar();
    return () => {
      canceladoRef.current = true;
    };
  }, [recarregar]);

  return { dados, loading, erro, recarregar }; // ⚡ permite "Tentar Novamente"
}