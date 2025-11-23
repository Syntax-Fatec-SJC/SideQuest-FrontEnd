import Sidebar from "../../../shared/components/Sidebar";
import { CardEntrega } from "./CardEntrega";
import { GraficoPizzaTarefas } from "./GraficoPizzaTarefas";
import type { AtualizacaoItem, EntregaItem, PizzaItem } from "../../../types/Dashboard";

interface DashboardViewProps {
  loading: boolean;
  erro: string | null;
  entregas: (EntregaItem & { projetoId: string })[];
  atualizacoes: AtualizacaoItem[];
  dadosPizza: PizzaItem[];
  onTarefaClick: (projetoId: string) => void;
}

export function DashboardView({ loading, erro, entregas, dadosPizza, onTarefaClick }: DashboardViewProps) {
  return (
    <div className="flex h-screen relative overflow-hidden mb-15 md:mb-0">
      <Sidebar />

      {/* Container principal */}
      <div className="flex-1 mt-4 p-2 sm:p-4 flex flex-col sm:flex-row gap-4 overflow-auto sm:overflow-visible custom-scrollbar">
        {/* Coluna esquerda */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {erro ? (
            <div className="flex-1 mt-4 p-4 flex flex-col justify-center items-center">
              <p className="text-xl mb-2 text-red-500">Erro ao carregar dashboard</p>
              <p>{erro}</p>
            </div>
          ) : loading ? (
            <div className="w-full flex justify-center items-center min-h-[300px]">
              <p className="text-center text-gray-500">Carregando gráfico...</p>
            </div>
          ) : (
            <GraficoPizzaTarefas dados={dadosPizza} />
          )}

          {loading ? (
            <div className="bg-white h-full mb-4 rounded-3xl p-6 flex justify-center items-center shadow-sm">
              <p className="text-center text-gray-500">Carregando próximas entregas...</p>
            </div>
          ) : (
            <CardEntrega entregas={entregas} onTarefaClick={onTarefaClick} />
          )}
        </div>

        {/* Coluna direita */}
        {/* <div className="w-full sm:w-[400px] flex flex-col min-w-0 mb-15 sm:mb-0">
          <CardAtualizacao atualizacoes={atualizacoes} className="flex-1" />
        </div> */}
      </div>
    </div>
  );
}

