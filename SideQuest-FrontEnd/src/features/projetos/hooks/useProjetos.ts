import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { projetoService } from "../../../services/ProjetoService"; 
import type { Projeto } from "../../../types/Projeto";
import { tratarErro } from "../../../shared/errors";
import { useToast } from "../../../shared/hooks/useToast";
import { obterUsuarioLogadoId } from "../utils/usuarioLogado";
import { mensagensErro, mensagensSucesso } from "../utils/validacoes";

export function useProjetos() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const usuarioLogadoId = obterUsuarioLogadoId();

  useEffect(() => {
    carregarProjetos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioLogadoId]);

  async function carregarProjetos() {
    if (!usuarioLogadoId) {
      setErro(mensagensErro.sessaoInvalida);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const lista = await projetoService.listarProjetosDoUsuario(usuarioLogadoId);
      setProjetos(lista);

      if (lista.length > 0 && !projetoSelecionadoId) {
        const salvo = localStorage.getItem("projetoSelecionadoId");
        if (salvo && lista.some(p => p.id === salvo)) {
          setProjetoSelecionadoId(salvo);
        } else {
          setProjetoSelecionadoId(lista[0].id);
          localStorage.setItem("projetoSelecionadoId", lista[0].id);
        }
      }
    } catch (e: unknown) {
      const erro = tratarErro(e);
      const mensagemErro = erro.message || "Falha ao carregar projetos";
      setErro(mensagemErro);
      show({ tipo: 'erro', mensagem: mensagemErro });
    } finally {
      setLoading(false);
    }
  }

  async function criarProjeto(dados: {
    nome: string;
    descricao?: string;
    usuarios?: string[];
    prazo: string;
  }) {
    if (!usuarioLogadoId || !dados.nome.trim()) return;
    setCreating(true);

    try {
      const novo = await projetoService.criarProjeto(usuarioLogadoId, {
        nome: dados.nome.trim(),
        prazo: dados.prazo,
        ...(dados.descricao && { descricao: dados.descricao })
      });
      setProjetos(prev => [...prev, novo]);
      setProjetoSelecionadoId(novo.id);
      localStorage.setItem("projetoSelecionadoId", novo.id);
      setShowModal(false);
      show({ tipo: 'sucesso', mensagem: mensagensSucesso.projetoCriado });
    } catch (e: unknown) {
      const erro = tratarErro(e);
      show({ tipo: 'erro', mensagem: erro.message || "Erro ao criar projeto" });
    } finally {
      setCreating(false);
    }
  }

  async function excluirProjeto(id: string, ev?: React.MouseEvent<HTMLButtonElement>) {
    if (ev) ev.stopPropagation();
    setRemovendoId(id);

    try {
      await projetoService.excluirProjeto(id);
      setProjetos(prev => prev.filter(p => p.id !== id));
      if (projetoSelecionadoId === id) {
        setProjetoSelecionadoId(null);
        localStorage.removeItem("projetoSelecionadoId");
      }
      show({ tipo: 'info', mensagem: mensagensSucesso.projetoRemovido });
    } catch (e: unknown) {
      const erro = tratarErro(e);
      show({ tipo: 'erro', mensagem: erro.message || "Erro ao excluir projeto" });
    } finally {
      setRemovendoId(null);
    }
  }

  function selecionar(id: string) {
    setProjetoSelecionadoId(id);
    localStorage.setItem("projetoSelecionadoId", id);
    navigate("/tarefas");
  }

  function abrirModal() {
    setShowModal(true);
  }

  function fecharModal() {
    if (!creating) {
      setShowModal(false);
    }
  }

  return {
    // Estados
    projetos,
    loading,
    erro,
    showModal,
    projetoSelecionadoId,
    creating,
    removendoId,
    
    // Funções
    carregarProjetos,
    criarProjeto,
    excluirProjeto,
    selecionar,
    abrirModal,
    fecharModal
  };
}