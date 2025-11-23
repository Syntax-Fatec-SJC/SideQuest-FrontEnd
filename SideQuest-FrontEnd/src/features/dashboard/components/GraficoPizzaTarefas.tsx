import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
          <PieChart margin={{ top: 30, bottom: 30, left: 0, right: 0 }}>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="chave"
              cx="50%"
              cy={isMobile ? "50%" : "55%"} 
              innerRadius={0}
              outerRadius={isMobile ? "70%" : 100}
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
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 flex flex-col gap-6 md:gap-12 pl-0 md:pl-8">
        {dados.map((item) => (
          <div key={item.chave} className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: cores[item.chave] }}
            />
            <div className="text-lg font-medium text-gray-700">{item.chave}</div>
          </div>
        ))}
      </div>
    </div>
  );
}