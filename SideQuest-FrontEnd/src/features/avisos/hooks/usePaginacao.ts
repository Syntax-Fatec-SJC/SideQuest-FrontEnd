import { useState } from 'react';
import type { Aviso } from '../../../types/Aviso';

const AVISOS_POR_PAGINA = 7;

/**
 * Hook para gerenciar paginação de avisos
 */
export const usePaginacao = (avisos: Aviso[]) => {
  const [paginaAtual, setPaginaAtual] = useState(1);

  const totalPaginas = Math.ceil(avisos.length / AVISOS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * AVISOS_POR_PAGINA;
  const indiceFinal = indiceInicial + AVISOS_POR_PAGINA;
  const avisosPaginados = avisos.slice(indiceInicial, indiceFinal);

  const irParaPagina = (numeroPagina: number) => {
    setPaginaAtual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    paginaAtual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    avisosPaginados,
    irParaPagina,
  };
};
