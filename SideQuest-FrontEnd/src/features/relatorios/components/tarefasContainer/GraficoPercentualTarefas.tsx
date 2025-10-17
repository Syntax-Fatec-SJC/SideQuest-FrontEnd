import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { tarefasUtils } from "../../utils/tarefasUtils";
import { mensagensInfo } from "../../utils/mensagens";
import type { Tarefa } from "../../../../types/Tarefa";

interface GraficoPercentualTarefasProps {
  tarefas: Tarefa[];
}

const GraficoPercentualTarefas: React.FC<GraficoPercentualTarefasProps> = ({ tarefas }) => {
  // Usar utilitários para lógica de negócio
  const porcentagem = tarefasUtils.calcularPorcentagemConcluidas(tarefas);
  const temTarefas = tarefasUtils.temTarefas(tarefas);

  const corConcluido = "#23c403ff";
  const corRestante = "#E5E7EB";

  const dados = [
    { name: "Concluído", value: porcentagem },
    { name: "Restante1", value: 100 - porcentagem - 0.01 },
    { name: "Restante2", value: 0.01 },
  ];

  // Se não há tarefas, mostrar mensagem
  if (!temTarefas) {
    return (
      <div className="w-full h-[30rem] flex justify-center items-center overflow-hidden">
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-gray-500 text-lg font-medium text-center">
            {mensagensInfo.nenhumaTarefa}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[30rem] flex justify-center items-center overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dados}
            startAngle={180}
            endAngle={0}
            innerRadius={220}
            outerRadius={260}
            dataKey="value"
            cornerRadius={25}
            cx="50%"
            cy="55%"
          >
            <Cell fill={corConcluido} />
            <Cell fill={corRestante} />
            <Cell fill={corRestante} />
          </Pie>

          <Label
            value={`${porcentagem}%`}
            position="center"
            style={{ fontSize: "5rem", fontWeight: "bold" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPercentualTarefas;
