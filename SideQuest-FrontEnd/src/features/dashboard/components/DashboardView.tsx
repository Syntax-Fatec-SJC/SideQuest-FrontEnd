import Sidebar from "../../../shared/components/Sidebar";
import { GraficoPizzaTarefas } from "./GraficoPizzaTarefas";
import { CardEntrega } from "./CardEntrega";
import { CardAtualizacao } from "./CardAtualizacao";
import type { AtualizacaoItem, EntregaItem, PizzaItem } from "../../../types/Dashboard";

interface DashboardViewProps {
  dadosPizza: PizzaItem[];
  loadingPizza: boolean;
  entregas: EntregaItem[];
  atualizacoes: AtualizacaoItem[];
  erro?: string | null;
  loadingEntregas?: boolean;
}

export function DashboardView({
  dadosPizza,
  loadingPizza,
  entregas,
  atualizacoes,
  erro = null,
  loadingEntregas = false,
}: DashboardViewProps) {
  return (
    <div className="flex relative">
      <Sidebar />

      <div className="flex-1 mt-4 p-4 custom-scrollbar flex gap-8">
        <div className="flex-1 flex flex-col gap-8">
          {erro ? (
            <div className="flex-1 mt-4 p-4 flex flex-col justify-center items-center">
              <p className="text-xl mb-2 text-red-500">Erro ao carregar dashboard</p>
              <p>{erro}</p>
            </div>
          ) : loadingPizza ? (
            <div className="w-full flex justify-center items-center min-h-[300px]">
              <p className="text-center text-gray-500">Carregando gráfico...</p>
            </div>
          ) : (
            <GraficoPizzaTarefas dados={dadosPizza} />
          )}

          {loadingEntregas ? (
            <div className="bg-white h-full mb-4 rounded-3xl p-6 flex justify-center items-center shadow-sm">
              <p className="text-center text-gray-500">Carregando próximas entregas...</p>
            </div>
          ) : (
            <CardEntrega entregas={entregas} />
          )}
        </div>
        <div className="w-[400px] flex flex-col">
          <CardAtualizacao atualizacoes={atualizacoes} className="flex-1" />
        </div>
      </div>
    </div>
  );
}
