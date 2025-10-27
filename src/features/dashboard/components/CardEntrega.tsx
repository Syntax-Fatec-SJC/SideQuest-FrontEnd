import { useState } from "react";
import { FaUser, FaCalendarAlt } from "react-icons/fa";
import type { EntregaItem } from "../../../types/Dashboard";

interface CardEntregaProps {
  entregas: (EntregaItem & { projetoId: string })[];
  className?: string;
  itensPorPagina?: number;
  onTarefaClick: (projetoId: string) => void;
}

export function CardEntrega({
  entregas,
  className = "",
  itensPorPagina = 2,
  onTarefaClick, 
}: CardEntregaProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const totalPaginas = Math.ceil(entregas.length / itensPorPagina);

  const startIndex = (paginaAtual - 1) * itensPorPagina;
  const endIndex = startIndex + itensPorPagina;
  const entregasPagina = entregas.slice(startIndex, endIndex);

  const irParaPagina = (pagina: number) => {
    if (pagina < 1) return;
    if (pagina > totalPaginas) return;
    setPaginaAtual(pagina);
  };

  return (
    <div className={`bg-white h-full mb-4 rounded-3xl p-6 flex flex-col gap-4 w-full shadow-sm ${className}`}>
      <h2 className="text-2xl font-semibold text-center mb-4 text-[#1D428A]">
        PRÓXIMAS ENTREGAS
      </h2>

      <div className="flex flex-wrap gap-4 justify-center">
        {entregasPagina.map((entrega, index) => (
          <div
            key={index}
            className="bg-pastel p-4 rounded-2xl flex-1 min-w-[350px] max-w-[calc(50%-8px)] flex flex-col gap-2 shadow-sm cursor-pointer hover:brightness-95 transition-all"
            onClick={() => onTarefaClick(entrega.projetoId)}
          >
            <div className="font-medium text-gray-800">{entrega.titulo}</div>
            <div className="text-sm text-gray-600">{entrega.descricao}</div>

            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FaUser className="text-gray-600" />{" "}
                {Array.isArray(entrega.responsavel)
                  ? entrega.responsavel.join(", ")
                  : entrega.responsavel}
              </span>
              <span className="flex items-center gap-1">
                {entrega.data} <FaCalendarAlt className="text-gray-600" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2 mt-4 text-sm text-gray-500">
          <button
            onClick={() => irParaPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-40"
          >
            ‹
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => irParaPagina(num)}
              className={`px-2 py-1 rounded hover:bg-gray-200 ${
                num === paginaAtual ? "font-semibold text-gray-800" : ""
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => irParaPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
