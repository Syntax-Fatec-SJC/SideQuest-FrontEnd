import { useState, useEffect } from "react";
import { tarefaService } from "../../../services/TarefaService";
import { useToast } from "../../../shared/hooks/useToast";
import { tratarErro } from "../../../shared/errors";
import { mensagensErro } from "../utils/mensagens";
import type { Tarefa } from "../../../types/Tarefa";


export function useRelatorios() {
  const { show } = useToast();
  const [projetoId, setProjetoId] = useState<string | null>(() =>
    localStorage.getItem("projetoSelecionadoId")
  );
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ouve mudanças do projeto selecionado em outras abas/componentes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "projetoSelecionadoId") {
        setProjetoId(localStorage.getItem("projetoSelecionadoId"));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Buscar tarefas do projeto
  useEffect(() => {
    if (!projetoId) {
      setTarefas([]);
      return;
    }

    const fetchTarefas = async () => {
      setLoading(true);
      setErro(null);
      
      try {
        const resultado = await tarefaService.listarTarefasDoProjeto(projetoId);
        setTarefas(resultado);
        setErro(null);
      } catch (e: unknown) {
        const erro = tratarErro(e);
        const mensagemErro = erro.message || mensagensErro.carregarTarefas;
        setErro(mensagemErro);
        setTarefas([]);
        show({ tipo: 'erro', mensagem: mensagemErro });
      } finally {
        setLoading(false);
      }
    };

    fetchTarefas();
  }, [projetoId, show]);

  return {
    projetoId,
    tarefas,
    loading,
    erro
  };
}