import React from "react";
import GraficoTarefas from "./GraficoTarefas";
import GraficoPercentualTarefas from "./GraficoPercentualTarefas";
import type { Tarefa } from "../../../../types/Tarefa";

interface GraficoTarefasContainerProps {
  tarefas: Tarefa[];
}

const GraficoTarefasContainer: React.FC<GraficoTarefasContainerProps> = ({ tarefas }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-4 w-full flex flex-col items-center gap-4">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-azul-escuro">
        TAREFAS
      </h2>

      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-2">
        <div className="flex-1 max-w-full min-w-[280px] h-80 md:h-92">
          <GraficoTarefas tarefas={tarefas} />
        </div>

        <div className="flex-1 max-w-full min-w-[280px] h-80 md:h-92">
          <GraficoPercentualTarefas tarefas={tarefas} />
        </div>
      </div>
    </div>
  );
};

export default GraficoTarefasContainer;