import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { projetoService } from "../../../services/ProjetoService";
import { tratarErro } from "../../../shared/errors";
import { useToast } from "../../../shared/hooks/useToast";
import type { Projeto } from "../../../types/Projeto";

export function useProjetos() {
  const navigate = useNavigate();
  const { show } = useToast();

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(
    () => localStorage.getItem("projetoSelecionadoId")
  );
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const canceladoRef = useRef(false);
  const ultimoErroRef = useRef<string | null>(null);

  const isErroConectividade = (msg: string) => {
    const texto = msg?.toLowerCase() || "";
    return texto.includes("conectividade") || texto.includes("conexão") || texto.includes("failed to fetch");
  };

  const carregarProjetos = useCallback(async () => {
    canceladoRef.current = false;

    // Verificar se há token antes de fazer requisição
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setProjetos([]);
      setErro(null);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const lista = await projetoService.listarProjetosDoUsuario();
      if (canceladoRef.current) return;

      setProjetos(lista);

      if (lista.length > 0) {
        const salvo = localStorage.getItem("projetoSelecionadoId");
        if (salvo && lista.some(p => p.id === salvo)) {
          setProjetoSelecionadoId(salvo);
        } else {
          setProjetoSelecionadoId(null); 
          localStorage.removeItem("projetoSelecionadoId");
        }
      }
    } catch (e: unknown) {
      if (canceladoRef.current) return;

      const erroObj = tratarErro(e);
      const mensagemErro = erroObj.message || "Falha ao carregar projetos";

      setErro(mensagemErro);

      if (!isErroConectividade(mensagemErro) && ultimoErroRef.current !== mensagemErro) {
        show({ tipo: "erro", mensagem: mensagemErro });
        ultimoErroRef.current = mensagemErro;
      }
    } finally {
      if (!canceladoRef.current) setLoading(false);
    }
  }, [show]);

  const criarProjeto = useCallback(
    async (form: { nome: string; prazo: string; descricao?: string }, usuarioId: string) => {
      canceladoRef.current = false;

      try {
        const resposta = await projetoService.criarProjeto(
          { nome: form.nome, prazo: form.prazo, descricao: form.descricao },
          usuarioId
        );
        if (canceladoRef.current) return;

        let created: Partial<Projeto> | undefined;
        if (resposta && typeof resposta === "object") {
          created = resposta as Partial<Projeto>;
        } else {
          created = undefined;
        }
        const novoProjeto: Projeto = {
          id: created?.id ?? (projetos.length + 1).toString(),
          nome: form.nome,
          descricao: form.descricao,
          prazo: form.prazo,
          status: created?.status ?? "ATIVO",
          usuarioIds: created?.usuarioIds ?? [usuarioId],
        };

        setProjetos(prev => [...prev, novoProjeto]);
        setProjetoSelecionadoId(novoProjeto.id);
        localStorage.setItem("projetoSelecionadoId", novoProjeto.id);
        setShowModal(false);

        show({ tipo: "sucesso", mensagem: "Projeto criado com sucesso" });
      } catch (e: unknown) {
        if (canceladoRef.current) return;

        const erroObj = tratarErro(e);
        const mensagemErro = erroObj.message || "Erro ao criar projeto";

        if (!isErroConectividade(mensagemErro) && ultimoErroRef.current !== mensagemErro) {
          show({ tipo: "erro", mensagem: mensagemErro });
          ultimoErroRef.current = mensagemErro;
        }
      }
    },
    [projetos.length, show]
  );

  const excluirProjeto = useCallback(
    async (id: string, ev?: React.MouseEvent<HTMLButtonElement>) => {
      if (ev) ev.stopPropagation();
      canceladoRef.current = false;
      setRemovendoId(id);

      try {
        await projetoService.excluirProjeto(id);
        if (canceladoRef.current) return;

        setProjetos(prev => prev.filter(p => p.id !== id));
        if (projetoSelecionadoId === id) {
          setProjetoSelecionadoId(null);
          localStorage.removeItem("projetoSelecionadoId");
        }

        show({ tipo: "info", mensagem: "Projeto removido com sucesso" });
      } catch (e: unknown) {
        if (canceladoRef.current) return;

        const erroObj = tratarErro(e);
        const mensagemErro = erroObj.message || "Erro ao excluir projeto";

        if (!isErroConectividade(mensagemErro) && ultimoErroRef.current !== mensagemErro) {
          show({ tipo: "erro", mensagem: mensagemErro });
          ultimoErroRef.current = mensagemErro;
        }
      } finally {
        if (!canceladoRef.current) setRemovendoId(null);
      }
    },
    [projetoSelecionadoId, show]
  );

  const selecionar = useCallback(
    (id: string) => {
      setProjetoSelecionadoId(id);
      localStorage.setItem("projetoSelecionadoId", id);
      navigate("/tarefas");
    },
    [navigate]
  );

  const abrirModal = useCallback(() => setShowModal(true), []);
  const fecharModal = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    carregarProjetos();
    return () => { canceladoRef.current = true; };
  }, [carregarProjetos]);

  return {
    projetos,
    loading,
    erro,
    showModal,
    projetoSelecionadoId,
    removendoId,
    carregarProjetos,
    criarProjeto,
    excluirProjeto,
    selecionar,
    abrirModal,
    fecharModal
  };
}