// src/membros/components/MembroCard.tsx
import React from 'react';
import type { MembroProjeto } from '../../../types/Membro';

interface MembroCardProps {
  membro: MembroProjeto;
  confirmandoRemocaoId: string | null;
  setConfirmandoRemocaoId: (id: string | null) => void;
  removerMembro: (usuarioId: string) => void;
  loadingAcao: boolean;
}

export const MembroCard: React.FC<MembroCardProps> = ({
  membro,
  confirmandoRemocaoId,
  setConfirmandoRemocaoId,
  removerMembro,
  loadingAcao,
}) => {
  return (
    <div className="bg-[#F5F5F5] rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <div className="flex flex-col">
        <span className="font-semibold flex items-center gap-2">
          {membro.nome}
          {membro.criador && (
            <span className="text-xs bg-indigo-600 text-white px-2 py-2px rounded-full">
              Criador
            </span>
          )}
        </span>
        <span className="text-sm text-gray-600">{membro.email}</span>
      </div>

      {!membro.criador &&
        (confirmandoRemocaoId === membro.usuarioId ? (
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <button
              disabled={loadingAcao}
              onClick={() => removerMembro(membro.usuarioId)}
              className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50 transition-colors"
            >
              Excluir
            </button>
            <button
              disabled={loadingAcao}
              onClick={() => setConfirmandoRemocaoId(null)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-sm disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            disabled={loadingAcao}
            onClick={() => setConfirmandoRemocaoId(membro.usuarioId)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
          >
            Excluir
          </button>
        ))}
    </div>
  );
};