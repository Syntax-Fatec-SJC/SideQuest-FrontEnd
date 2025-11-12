import { useState, useEffect, useCallback, useRef } from 'react';
import { membrosService } from '../../../services/MembrosService';
import { usuarioService } from '../../../services/AuthService';
import { useToast } from '../../../shared/hooks/useToast';
import { tratarErro } from '../../../shared/errors';
import type { LinhaEdicao, MembroProjeto, UsuarioResumo } from '../../../types/Membro';
import type { ApiError } from '../../../shared/errors/ApiError';
import type { UsuarioSessao } from '../../../shared/hooks/useAuth';

export const useMembros = (projetoSelecionadoId: string | null, usuario: UsuarioSessao | null) => {
  const { show } = useToast();

  const [membros, setMembros] = useState<MembroProjeto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([]);
  const [linhaEdicao, setLinhaEdicao] = useState<LinhaEdicao | null>(null);
  const [loadingLista, setLoadingLista] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [membrosPorPagina, setMembrosPorPagina] = useState(8);
  const [error, setError] = useState<ApiError | null>(null);

  const canceladoRef = useRef(false);

  useEffect(() => {
    const calcularMembrosPorPagina = () => {
      const altura = window.innerHeight;
      const estimado = Math.floor((altura - 300) / 80);
      setMembrosPorPagina(Math.max(3, estimado));
    };
    calcularMembrosPorPagina();
    window.addEventListener('resize', calcularMembrosPorPagina);
    return () => window.removeEventListener('resize', calcularMembrosPorPagina);
  }, []);

  const carregarDados = useCallback(async () => {
    if (!projetoSelecionadoId) {
      setMembros([]);
      setUsuarios([]);
      setError(null);
      setLoadingLista(false);
      return;
    }

    canceladoRef.current = false;
    setLoadingLista(true);
    setError(null);

    try {
      const [membrosResp, usuariosResp] = await Promise.all([
        membrosService.listarMembrosProjeto(projetoSelecionadoId),
        usuarioService.listarUsuarios(),
      ]);

      if (canceladoRef.current) return;

      setMembros(membrosResp || []);
      setUsuarios(usuariosResp || []);

      if (usuario && !membrosResp.some(m => m.usuarioId === usuario.id)) {
        setError({ message: 'Falha ao conectar com o servidor' } as ApiError);
      } else {
        setError(null);
      }
    } catch (e: unknown) {
      if (canceladoRef.current) return;
      const erroObj = tratarErro(e);
      setError(erroObj);
      setMembros([]);
      setUsuarios([]);
    } finally {
      if (!canceladoRef.current) setLoadingLista(false);
    }
  }, [projetoSelecionadoId, usuario]);

  useEffect(() => {
    void carregarDados();
    return () => {
      canceladoRef.current = true;
    };
  }, [carregarDados]);

  const membrosIds = new Set(membros.map(m => m.usuarioId));
  const usuariosDisponiveis = usuarios.filter(u => !membrosIds.has(u.id));

  const membrosFiltrados = (busca: string) =>
    membros.filter(m =>
      [m.nome, m.email].some(v => v.toLowerCase().includes(busca.toLowerCase()))
    );

  const membrosPaginaAtual = (busca: string) => {
    const filtered = membrosFiltrados(busca);
    const indexUltimo = paginaAtual * membrosPorPagina;
    const indexPrimeiro = indexUltimo - membrosPorPagina;
    return filtered.slice(indexPrimeiro, indexUltimo);
  };

  const iniciarEdicao = () => {
    if (linhaEdicao) {
      show({ tipo: 'info', mensagem: 'Já existe uma linha em edição' });
      return;
    }
    setLinhaEdicao({ nome: '', email: '', usuarioIdSelecionado: undefined });
  };

  const cancelarEdicao = () => setLinhaEdicao(null);

  const salvarLinha = async () => {
    if (!projetoSelecionadoId || !linhaEdicao) return;
    setLoadingAcao(true);

    try {
      if (!linhaEdicao.usuarioIdSelecionado) {
        setLinhaEdicao(prev =>
          prev ? { ...prev, erro: 'Selecione um usuário existente' } : prev
        );
        return;
      }

      await membrosService.adicionarMembroProjeto(
        projetoSelecionadoId,
        linhaEdicao.usuarioIdSelecionado
      );

      const usuarioAdicionado = usuarios.find(u => u.id === linhaEdicao.usuarioIdSelecionado);
      if (usuarioAdicionado) {
        setMembros(prev => [
          ...prev,
          {
            usuarioId: usuarioAdicionado.id,
            nome: usuarioAdicionado.nome,
            email: usuarioAdicionado.email,
            criador: false,
          },
        ]);
      }

      setLinhaEdicao(null);
      show({ tipo: 'sucesso', mensagem: 'Membro adicionado' });
    } catch (e: unknown) {
      const erroObj = tratarErro(e);
      show({ tipo: 'erro', mensagem: erroObj.message });
    } finally {
      setLoadingAcao(false);
    }
  };

  const removerMembro = async (usuarioId: string) => {
    if (!projetoSelecionadoId) return;
    setLoadingAcao(true);

    try {
      await membrosService.removerMembroProjeto(projetoSelecionadoId, usuarioId);
      setMembros(prev => prev.filter(m => m.usuarioId !== usuarioId));
      show({ tipo: 'info', mensagem: 'Membro removido' });
    } catch (e: unknown) {
      const erroObj = tratarErro(e);
      show({ tipo: 'erro', mensagem: erroObj.message });
    } finally {
      setLoadingAcao(false);
    }
  };

  return {
    membros,
    usuarios,
    linhaEdicao,
    setLinhaEdicao,
    loadingLista,
    loadingAcao,
    setLoadingAcao,
    carregarDados,
    usuariosDisponiveis,
    paginaAtual,
    setPaginaAtual,
    membrosPorPagina,
    membrosFiltrados,
    membrosPaginaAtual,
    iniciarEdicao,
    cancelarEdicao,
    salvarLinha,
    removerMembro,
    error,
  };
};