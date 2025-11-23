import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { PizzaItem } from "../../../types/Dashboard";

interface GraficoPizzaTarefasProps {
  dados: PizzaItem[];
  height?: number;
}

export function GraficoPizzaTarefas({ dados, height = 260 }: GraficoPizzaTarefasProps) {
  const cores: Record<PizzaItem["chave"], string> = {
    Pendentes: "#ffb535ff",
    "Em Desenvolvimento": "#0062ffff",
    Concluidas: "#23c403ff",
  };

  // Detecta mobile para ajustar comportamento igual ao gráfico de relatórios
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const temDados = dados.some((d) => d.valor > 0);

  if (!temDados) {
    return (
      <div className="bg-white rounded-3xl p-6 flex justify-center items-center w-full h-[260px]">
        <span className="text-gray-500 text-lg font-medium text-center">
          Nenhuma tarefa encontrada para o usuário.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 w-full">
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="chave"
              cx={isMobile ? "50%" : "55%"}
              cy="50%"
              innerRadius={0}
              outerRadius={isMobile ? "55%" : 130}
              // Mobile: só número; Desktop: chave: valor
              label={(entry) =>
                isMobile ? `${entry.valor}` : `${entry.chave}: ${entry.valor}`
              }
              labelLine={!isMobile}
              paddingAngle={0}
            >
              {dados.map((entry) => (
                <Cell key={entry.chave} fill={cores[entry.chave]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}`, name]}
              wrapperStyle={{ outline: "none" }}
            />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 flex flex-col gap-12">
        {dados.map((item) => (
          <div key={item.chave} className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: cores[item.chave] }}
            />
            <div className="text-lg font-medium text-gray-700">{item.chave}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
