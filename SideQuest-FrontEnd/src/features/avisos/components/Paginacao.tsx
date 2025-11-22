import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}

/**
 * Componente de paginação reutilizável
 */
export default function Paginacao({ paginaAtual, totalPaginas, onMudarPagina }: PaginacaoProps) {
  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      onMudarPagina(paginaAtual - 1);
    }
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      onMudarPagina(paginaAtual + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-6 flex-shrink-0 flex-wrap">
      <button
        onClick={paginaAnterior}
        disabled={paginaAtual === 1}
        className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
          paginaAtual === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-azul-escuro border-azul-escuro hover:bg-azul-escuro hover:text-white'
        }`}
        aria-label="Página anterior"
      >
        <MdChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Números de página */}
      <div className="flex gap-1 flex-wrap justify-center">
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numeroPagina => {
          // Mostra sempre a primeira, última, atual e adjacentes
          const mostrarPagina =
            numeroPagina === 1 ||
            numeroPagina === totalPaginas ||
            Math.abs(numeroPagina - paginaAtual) <= 1;

          const mostrarReticencias =
            (numeroPagina === paginaAtual - 2 && paginaAtual > 3) ||
            (numeroPagina === paginaAtual + 2 && paginaAtual < totalPaginas - 2);

          if (mostrarReticencias) {
            return (
              <span key={numeroPagina} className="px-2 py-1 sm:px-3 sm:py-2 text-gray-400 text-sm sm:text-base">
                ...
              </span>
            );
          }

          if (!mostrarPagina) return null;

          return (
            <button
              key={numeroPagina}
              onClick={() => onMudarPagina(numeroPagina)}
              className={`min-w-[32px] sm:min-w-[40px] px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base rounded-lg border transition-all ${
                paginaAtual === numeroPagina
                  ? 'bg-azul-escuro text-white border-azul-escuro font-semibold'
                  : 'bg-white text-azul-escuro border-gray-300 hover:border-azul-escuro hover:bg-azul-claro hover:text-white'
              }`}
            >
              {numeroPagina}
            </button>
          );
        })}
      </div>

      <button
        onClick={proximaPagina}
        disabled={paginaAtual === totalPaginas}
        className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
          paginaAtual === totalPaginas
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-azul-escuro border-azul-escuro hover:bg-azul-escuro hover:text-white'
        }`}
        aria-label="Próxima página"
      >
        <MdChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}
