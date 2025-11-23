import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { tarefasUtils } from "../../utils/tarefasUtils";
import { mensagensInfo } from "../../utils/mensagens";
import type { Tarefa } from "../../../../types/Tarefa";

interface GraficoPercentualTarefasProps {
  tarefas: Tarefa[];
}

const GraficoPercentualTarefas: React.FC<GraficoPercentualTarefasProps> = ({ tarefas }) => {
  const porcentagem = tarefasUtils.calcularPorcentagemConcluidas(tarefas);
  const temTarefas = tarefasUtils.temTarefas(tarefas);

  const corConcluido = "#23c403ff";
  const corRestante = "#E5E7EB";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dados = [
    { name: "Concluído", value: porcentagem },
    { name: "Restante1", value: 100 - porcentagem - 0.01 },
    { name: "Restante2", value: 0.01 },
  ];

  if (!temTarefas) {
    return (
      <div className="w-full h-[20rem] flex justify-center items-center overflow-hidden">
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-gray-500 text-lg font-medium text-center">
            {mensagensInfo.nenhumaTarefa}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
        Percentual de Conclusão do Projeto
      </h3>
      
      {/* Altura ajustada para mobile e desktop */}
      <div className="w-full h-[18rem] md:h-[25rem] flex justify-center items-center overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              startAngle={180}
              endAngle={0}
              dataKey="value"
              cornerRadius={isMobile ? 10 : 25} 
              cx="50%"
              cy={isMobile ? "70%" : "55%"} 
              innerRadius={isMobile ? "60%" : 150}
              outerRadius={isMobile ? "80%" : 180}
              
              paddingAngle={0}
            >
              <Cell fill={corConcluido} />
              <Cell fill={corRestante} />
              <Cell fill={corRestante} />
              
              <Label
                value={`${porcentagem}%`}
                position="center"
                // Mantém a fonte responsiva para evitar quebras
                className="font-bold fill-gray-700"
                style={{ 
                  fontSize: isMobile ? "3rem" : "4rem", 
                  fontWeight: "bold" 
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Margem responsiva para a legenda */}
      <div className="flex justify-center gap-8 -mt-12 md:-mt-35 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: corConcluido }}></div>
          <span className="text-gray-600 text-sm md:text-base">Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: corRestante }}></div>
          <span className="text-gray-600 text-sm md:text-base">Em progresso</span>
        </div>
      </div>
    </div>
  );
};

export default GraficoPercentualTarefas;