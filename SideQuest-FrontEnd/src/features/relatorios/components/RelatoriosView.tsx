import Sidebar from "../../../shared/components/Sidebar";
import GraficoMembros from "./GraficoMembros";
import GraficoTarefasContainer from "./tarefasContainer/GraficoTarefasContainer";
import { mensagensInfo } from "../utils/mensagens";
import type { Tarefa } from "../../../types/Tarefa";
import type { TarefasMembro } from "../hooks/useTarefasPorMembro";

interface RelatoriosViewProps {
  tarefas: Tarefa[];
  dadosMembros: TarefasMembro[];
  tarefasLoading: boolean;
  membrosLoading: boolean;
  erro: string | null;
}


export function RelatoriosView({
  tarefas,
  dadosMembros,
  tarefasLoading,
  membrosLoading,
  erro
}: RelatoriosViewProps) {
  if (erro) {
    const isConectividadeError = erro.includes('conectividade') || erro.includes('conexão');
    
    return (
      <div className="flex relative">
        <Sidebar />
        <div className="flex-1 p-4 mt-4 custom-scrollbar flex flex-col justify-center items-center">
          <div className="text-red-500 text-center">
            <p className="text-xl mb-2">
              {isConectividadeError ? 'Problema de Conectividade' : 'Erro ao carregar relatórios'}
            </p>
            <p>{erro}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative">
      <Sidebar />
      <div
        className="flex-1 p-4 custom-scrollbar flex flex-col justify-start items-center gap-8 max-sm:mt-4 max-sm:mb-20 max-sm:mx-2 max-sm:p-2">
        {/* Gráfico de Tarefas*/}
        {tarefasLoading ? (
          <div className="w-full flex justify-center items-center min-h-[300px]">
            <p className="text-center text-gray-500">{mensagensInfo.carregandoTarefas}</p>
          </div>
        ) : (
          <GraficoTarefasContainer tarefas={tarefas} />
        )}

        {/* gráfico de membros */}
        <div className="w-full">
          {membrosLoading ? (
            <p className="text-center text-gray-500">{mensagensInfo.carregandoMembros}</p>
          ) : (
            <GraficoMembros
              dados={dadosMembros}
              maximoDeBarras={8}
              espacamentoBarras="20%"
            />
          )}
        </div>
      </div>
    </div>
  );
}