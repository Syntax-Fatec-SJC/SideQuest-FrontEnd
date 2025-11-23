import React, { useState, useEffect } from "react";
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
  const temTarefas = tarefasUtils.temTarefas(tarefas);
  const statusCounts = tarefasUtils.contarPorStatus(tarefas);
  
  // === 1. Adicionando a lógica de detecção de Mobile ===
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Executa na montagem
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // ====================================================

  const dados = [
    { name: "Pendente", value: statusCounts.pendente },
    { name: "Desenvolvimento", value: statusCounts.desenvolvimento },
    { name: "Concluído", value: statusCounts.concluido }
  ];

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
    // Ajustei a altura para ser um pouco mais flexível em mobile se necessário
    <div className="w-full h-[22rem] md:h-92 flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dados}
            dataKey="value"
            nameKey="name"
            
            // === 2. Lógica Dinâmica ===
            // Mobile: Centralizado (50%)
            // Desktop: Levemente à direita (55%) - Seu valor original
            cx={isMobile ? "50%" : "55%"}
            
            cy="50%"
            
            // Mobile: 55% do tamanho (Deixa espaço para as labels externas não cortarem)
            // Desktop: 140px fixo - Seu valor original
            outerRadius={isMobile ? "55%" : 140} 
            
            // Ajustei o label para sumir se a tela for MUITO pequena, ou manter normal
            label={isMobile ? 
              (entry) => `${entry.value}` // Mobile: Mostra só o número para economizar espaço
              : (entry) => `${entry.name}: ${entry.value}` // Desktop: Completo
            }
          >
            {dados.map((entry) => (
              <Cell key={entry.name} fill={coresPorStatus[entry.name as Status]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value} tarefas`} />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoTarefas;