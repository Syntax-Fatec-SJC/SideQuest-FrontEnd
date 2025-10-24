import { useRelatorios } from "../hooks/useRelatorios";
import { useTarefasPorMembro } from "../hooks/useTarefasPorMembro";
import { RelatoriosView } from "../components/RelatoriosView";

export function RelatoriosContainer() {
  const { projetoId, tarefas, loading: tarefasLoading, erro } = useRelatorios();
  const { dados: dadosMembros, loading: membrosLoading } = useTarefasPorMembro(projetoId || "");

  return (
    <RelatoriosView
      tarefas={tarefas}
      dadosMembros={dadosMembros}
      tarefasLoading={tarefasLoading}
      membrosLoading={membrosLoading}
      erro={erro}
    />
  );
}