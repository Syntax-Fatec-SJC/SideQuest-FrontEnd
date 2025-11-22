import type { Aviso } from '../../../types/Aviso';
import AvisoCard from './AvisoCard';

interface ListaAvisosProps {
  avisos: Aviso[];
  usuarioId?: string;
  onClickAviso: (aviso: Aviso) => void;
}

/**
 * Componente que renderiza a lista de avisos
 */
export default function ListaAvisos({ avisos, usuarioId, onClickAviso }: ListaAvisosProps) {
  if (avisos.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Nenhum aviso encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 mb-4">
      {avisos.map(aviso => (
        <AvisoCard
          key={aviso.id}
          aviso={aviso}
          usuarioId={usuarioId}
          onClick={onClickAviso}
        />
      ))}
    </div>
  );
}
