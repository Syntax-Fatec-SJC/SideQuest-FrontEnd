import type { Aviso } from '../../../types/Aviso';
import { MdOutlineArrowForward } from 'react-icons/md';
import { cores, icones } from '../constants/avisoConstants';
import { formatarData, formatarMensagem } from '../utils/avisoUtils';

interface AvisoCardProps {
  aviso: Aviso;
  usuarioId?: string;
  onClick: (aviso: Aviso) => void;
}

/**
 * Componente para exibir um card de aviso
 */
export default function AvisoCard({ aviso, usuarioId, onClick }: AvisoCardProps) {
  return (
    <div
      onClick={() => onClick(aviso)}
      className={`relative flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 rounded-lg border-2 shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${cores[aviso.tipo]} w-full`}
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <div className="flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
          {icones[aviso.tipo]}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-normal text-xs sm:text-sm md:text-base text-gray-700 break-words">
            {formatarMensagem(aviso, usuarioId)}
          </p>
          {aviso.data && (
            <span className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {formatarData(aviso.data)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 mt-1 sm:mt-0">
        {!aviso.visualizado && (
          <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        <MdOutlineArrowForward size={20} className="text-gray-500 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      </div>
    </div>
  );
}
