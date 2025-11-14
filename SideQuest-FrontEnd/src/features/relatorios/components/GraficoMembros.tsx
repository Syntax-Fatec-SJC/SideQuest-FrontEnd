import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mensagensInfo } from "../utils/mensagens";
import type { TarefasMembro } from "../hooks/useTarefasPorMembro";

interface GraficoMembrosProps {
  dados?: TarefasMembro[];
  maximoDeBarras?: number;
  espacamentoBarras?: string;
}

const GraficoMembros: React.FC<GraficoMembrosProps> = ({
  dados = [],
  maximoDeBarras = 8,
  espacamentoBarras = "20%",
}) => {
  const dadosFiltrados = dados
    .filter((membro) => membro.tarefasConcluidas > 0)
    .sort((a, b) => b.tarefasConcluidas - a.tarefasConcluidas)
    .slice(0, maximoDeBarras);

  const alturaBarra = 50;
  const alturaGrafico = Math.max(dadosFiltrados.length * (alturaBarra + 50), 150);

  const nenhumMembroConcluiu = dadosFiltrados.length === 0;

  const larguraEixoY = Math.min(
    Math.max(...dadosFiltrados.map((m) => m.nome.length)) * 8,
    120
  );

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-4 sm:p-8 w-full flex flex-col items-center">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 text-center text-azul-escuro">
        MEMBROS
      </h2>

      <div className="flex flex-col lg:flex-row justify-center w-full gap-6">
        {nenhumMembroConcluiu ? (
          <div className="flex items-center justify-center w-full h-60">
            <span className="text-gray-500 text-lg font-medium text-center">
              {mensagensInfo.nenhumMembroConcluiu}
            </span>
          </div>
        ) : (
          <>
            {/* Gráfico */}
            <div className="w-full lg:flex-1 min-w-[280px]">
              <ResponsiveContainer width="100%" height={alturaGrafico}>
                <BarChart
                  data={dadosFiltrados}
                  layout="vertical"
                  margin={{ top: 10, right: 5, bottom: 10, left: 5}}
                  barCategoryGap={espacamentoBarras}
                >
                  <defs>
                    <linearGradient id="azulVerdeGradiente" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "var(--color-azul-claro)", stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: "#10B981", stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>

                  <XAxis type="number" allowDecimals={false} domain={[0, 8]} />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={larguraEixoY}
                    tick={{ dx: 0 }}
                  />

                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    wrapperStyle={{
                      boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="tarefasConcluidas"
                    fill="url(#azulVerdeGradiente)"
                    barSize={alturaBarra}
                    radius={[0, 10, 10, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lista de membros */}
            <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-auto max-h-[70vh] lg:max-h-full">
              {dadosFiltrados.map((membro) => (
                <div
                  key={membro.nome}
                  className="bg-[#F2E9E9] p-4 rounded-xl flex flex-col justify-center"
                >
                  <span className="font-medium text-gray-800 break-words leading-snug">
                    {membro.nome}
                  </span>
                  <span className="text-sm text-gray-600">{membro.tarefasConcluidas} tarefas</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recharts ajustes visuais */}
      <style>{`
        .recharts-wrapper,
        .recharts-surface,
        .recharts-layer,
        .recharts-bar-rectangle {
          outline: none !important;
          border: none !important;
          stroke: none !important;
        }
      `}</style>
    </div>
  );
};

export default GraficoMembros;

