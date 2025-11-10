import { ProjetosView } from "../components/ProjetosView";
import { useProjetos } from "../hooks/useProjetos";
import { useAuth } from "../../../shared/hooks/useAuth";
import { ConexaoPage } from "../../../shared/components/ConexaoPage";

export function ProjetosContainer() {
  const { usuario } = useAuth();
  const state = useProjetos();

  const criarProjeto = async (dados: { nome: string; prazo: string; descricao?: string; usuarios?: string[] }) => {
    if (!usuario?.id) return;
    await state.criarProjeto(dados, usuario.id);
  };

  if (state.erro && (state.erro.toLowerCase().includes("conectividade") || state.erro.toLowerCase().includes("conexão"))) {
    return <ConexaoPage erroMensagem={state.erro} onTentarNovamente={state.carregarProjetos} />;
  }

  return (
    <ProjetosView
    projetos={state.projetos}
    loading={state.loading}
    erro={state.erro}
    showModal={state.showModal}
    projetoSelecionadoId={state.projetoSelecionadoId}
    creating={false} 
    removendoId={state.removendoId}
    carregarProjetos={state.carregarProjetos}
    criarProjeto={criarProjeto}
    excluirProjeto={state.excluirProjeto}
    selecionar={state.selecionar}
    abrirModal={state.abrirModal}
    fecharModal={state.fecharModal}
  />
  );
}