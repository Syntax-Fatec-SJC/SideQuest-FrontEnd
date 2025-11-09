import { useRelatorios } from "../hooks/useRelatorios";
import { useTarefasPorMembro } from "../hooks/useTarefasPorMembro";
import { RelatoriosView } from "../components/RelatoriosView";
import { ConexaoPage } from "../../../shared/components/ConexaoPage";

export function RelatoriosContainer() {
  const { projetoId, tarefas, loading: tarefasLoading, erro, recarregar: recarregarTarefas } = useRelatorios();
  const { dados: dadosMembros, loading: membrosLoading, erro: erroMembros, recarregar: recarregarMembros } = useTarefasPorMembro(projetoId || "");

  const isConexaoErro = (mensagem: string | null) =>
    mensagem?.toLowerCase().includes("conectividade") || mensagem?.toLowerCase().includes("conexão");

  if (isConexaoErro(erro) || isConexaoErro(erroMembros)) {
    return (
      <ConexaoPage
        erroMensagem={erro || erroMembros || "Erro de conectividade"}
        onTentarNovamente={() => {
          recarregarTarefas();
          recarregarMembros();
        }}
      />
    );
  }

  return (
    <RelatoriosView
      tarefas={tarefas}
      dadosMembros={dadosMembros}
      tarefasLoading={tarefasLoading}
      membrosLoading={membrosLoading}
      erro={null} // Erros tratados pelo ConexaoPage
    />
  );
}
