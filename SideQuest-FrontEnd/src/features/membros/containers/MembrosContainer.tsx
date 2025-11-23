import { useState, useEffect } from "react";
import { useMembros } from "../hooks/useMembros";
import { MembrosView } from "../components/MembrosView";
import { useAuth } from "../../../shared/hooks/useAuth";
import { ConexaoPage } from "../../../shared/components/ConexaoPage";

export function MembrosContainer() {
  const { usuario } = useAuth(); 

  const projetoSelecionadoId =
    typeof window !== "undefined" ? localStorage.getItem("projetoSelecionadoId") : null;

  const [busca, setBusca] = useState("");
  const [confirmandoRemocaoId, setConfirmandoRemocaoId] = useState<string | null>(null);
  const [listaAberta, setListaAberta] = useState(false);

  const hookResult = useMembros(projetoSelecionadoId, usuario);

  useEffect(() => {
    if (!hookResult) {
      console.error("useMembros retornou undefined");
    }
  }, [hookResult]);

  if (!hookResult) {
    return (
      <ConexaoPage
        erroMensagem="Erro ao carregar componente de membros"
        onTentarNovamente={() => window.location.reload()}
      />
    );
  }

  const {
    linhaEdicao,
    setLinhaEdicao,
    loadingLista,
    loadingAcao,
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
    carregarDados,
    error
  } = hookResult;

  const membrosNaPagina = membrosPaginaAtual ? membrosPaginaAtual(busca) : [];
  const totalPaginas = membrosFiltrados 
    ? Math.ceil(membrosFiltrados(busca).length / (membrosPorPagina || 1))
    : 0;  const erroServidor = error && membrosNaPagina.length === 0;

  if (erroServidor) {
    return (
      <ConexaoPage
        erroMensagem={error?.message}
        onTentarNovamente={carregarDados}
      />
    );
  }

  return (
    <MembrosView
      projetoSelecionadoId={projetoSelecionadoId}
      busca={busca}
      setBusca={setBusca}
      paginaAtual={paginaAtual ?? 1}
      setPaginaAtual={setPaginaAtual ?? (() => {})}
      totalPaginas={totalPaginas}
      membrosNaPagina={membrosNaPagina}
      linhaEdicao={linhaEdicao}
      setLinhaEdicao={setLinhaEdicao ?? (() => {})}
      usuariosDisponiveis={usuariosDisponiveis ?? []}
      listaAberta={listaAberta}
      setListaAberta={setListaAberta}
      iniciarEdicao={iniciarEdicao ?? (() => {})}
      cancelarEdicao={cancelarEdicao ?? (() => {})}
      salvarLinha={salvarLinha ?? (async () => {})}
      removerMembro={removerMembro ?? (async () => {})}
      confirmandoRemocaoId={confirmandoRemocaoId}
      setConfirmandoRemocaoId={setConfirmandoRemocaoId}
      loadingLista={loadingLista ?? false}
      loadingAcao={loadingAcao ?? false}
    />
  );
}
