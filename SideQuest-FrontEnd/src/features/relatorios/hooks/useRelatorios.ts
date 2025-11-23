import { useState, useEffect, useRef, useCallback } from "react";
import { tarefaService } from "../../../services/TarefaService";
import { useToast } from "../../../shared/hooks/useToast";
import { tratarErro } from "../../../shared/errors";
import { mensagensErro } from "../utils/mensagens";
import type { Tarefa } from "../../../types/Tarefa";

export function useRelatorios() {
  const { show } = useToast();
  const [projetoId, setProjetoId] = useState<string | null>(
    () => localStorage.getItem("projetoSelecionadoId")
  );
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const ultimoErroRef = useRef<string | null>(null);
  const canceladoRef = useRef(false);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "projetoSelecionadoId") {
        const novoProjeto = localStorage.getItem("projetoSelecionadoId");
        if (novoProjeto !== projetoId) {
          setProjetoId(novoProjeto);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [projetoId]);

  const recarregar = useCallback(async () => {
    if (!projetoId) {
      setTarefas([]);
      setLoading(false);
      setErro(null);
      return;
    }

    canceladoRef.current = false;
    setLoading(true);
    setErro(null);

    try {
      const resultado = await tarefaService.listarTarefasDoProjeto(projetoId);
      if (canceladoRef.current) return;

      setTarefas(resultado);
      setErro(null);
      ultimoErroRef.current = null;
    } catch (e: unknown) {
      if (canceladoRef.current) return;

      const erroObj = tratarErro(e);
      const mensagemErro = erroObj.message || mensagensErro.carregarTarefas;

      setTarefas([]);
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
  }, [projetoId, show]);

  useEffect(() => {
    recarregar();
    return () => {
      canceladoRef.current = true;
    };
  }, [recarregar]);

  return {
    projetoId,
    tarefas,
    loading,
    erro,      
    recarregar, 
  };
}