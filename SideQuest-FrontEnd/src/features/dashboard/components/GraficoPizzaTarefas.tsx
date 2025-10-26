import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { PizzaItem } from "../../../types/Dashboard";

interface GraficoPizzaTarefasProps {
  dados: PizzaItem[];
  height?: number;
}

function renderInsideLabel({
  cx,
  cy,
  innerRadius,
  outerRadius,
  midAngle,
  value,
}: PieLabelRenderProps): React.ReactNode {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof innerRadius !== "number" ||
    typeof outerRadius !== "number" ||
    typeof midAngle !== "number" ||
    typeof value !== "number"
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ pointerEvents: "none", fontWeight: 600 }}
    >
      {value}
    </text>
  );
}

export function GraficoPizzaTarefas({ dados, height = 260 }: GraficoPizzaTarefasProps) {
  const cores: Record<PizzaItem["chave"], string> = {
    Pendentes: "#ffb535ff",
    "Em Desenvolvimento": "#0062ffff",
    Concluidas: "#23c403ff",
  };

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 w-full">
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="chave"
              cx="50%"
              cy="50%"
              innerRadius={0} 
              outerRadius={130}
              label={renderInsideLabel}
              labelLine={false}
              paddingAngle={0}
            >
              {dados.map((entry) => (
                <Cell key={entry.chave} fill={cores[entry.chave]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              wrapperStyle={{ outline: "none" }}
            />
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
