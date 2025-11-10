import { useState } from "react";
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
  } = useMembros(projetoSelecionadoId, usuario); 

  const membrosNaPagina = membrosPaginaAtual(busca);
  const totalPaginas = Math.ceil(membrosFiltrados(busca).length / membrosPorPagina);

  const erroServidor = error && membrosNaPagina.length === 0;

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
      paginaAtual={paginaAtual}
      setPaginaAtual={setPaginaAtual}
      totalPaginas={totalPaginas}
      membrosNaPagina={membrosNaPagina}
      linhaEdicao={linhaEdicao}
      setLinhaEdicao={setLinhaEdicao}
      usuariosDisponiveis={usuariosDisponiveis}
      listaAberta={listaAberta}
      setListaAberta={setListaAberta}
      iniciarEdicao={iniciarEdicao}
      cancelarEdicao={cancelarEdicao}
      salvarLinha={salvarLinha}
      removerMembro={removerMembro}
      confirmandoRemocaoId={confirmandoRemocaoId}
      setConfirmandoRemocaoId={setConfirmandoRemocaoId}
      loadingLista={loadingLista}
      loadingAcao={loadingAcao}
    />
  );
}
