import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { tarefasUtils } from "../../utils/tarefasUtils";
import { mensagensInfo } from "../../utils/mensagens";
import type { Tarefa, Status } from "../../../../types/Tarefa";

interface GraficoStatusProps {
  tarefas: Tarefa[];
}

const coresPorStatus: Record<Status, string> = {
  Pendente: "#ffb535ff",
  Desenvolvimento: "#0062ffff",
  Concluído: "#23c403ff",
};

const GraficoTarefas: React.FC<GraficoStatusProps> = ({ tarefas }) => {
  // Usar utilitários para lógica de negócio
  const temTarefas = tarefasUtils.temTarefas(tarefas);
  const statusCounts = tarefasUtils.contarPorStatus(tarefas);
  
  const dados = [
    { name: "Pendente", value: statusCounts.pendente },
    { name: "Desenvolvimento", value: statusCounts.desenvolvimento },
    { name: "Concluído", value: statusCounts.concluido }
  ];

  // Se não tem tarefas mostrar mensagem
  if (!temTarefas) {
    return (
      <div className="w-full h-92 flex justify-center items-center">
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-gray-500 text-lg font-medium text-center">
            {mensagensInfo.nenhumaTarefa}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-92 m-2 flex justify-center items-center">
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={dados}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={140} 
        label={(entry) => `${entry.name}: ${entry.value}`}
      >
        {dados.map((entry) => (
          <Cell key={entry.name} fill={coresPorStatus[entry.name as Status]} />
        ))}
      </Pie>
      <Tooltip formatter={(value: number) => `${value} tarefas`} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

  );
};

export default GraficoTarefas;
