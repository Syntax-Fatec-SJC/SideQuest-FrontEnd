import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../shared/components/Sidebar';
import useAuth from '../../shared/hooks/useAuth';
import { useToast } from '../../shared/hooks/useToast';
import { useAvisos } from './hooks/useAvisos';
import { usePaginacao } from './hooks/usePaginacao';
import ListaAvisos from './components/ListaAvisos';
import Paginacao from './components/Paginacao';
import type { Aviso } from '../../types/Aviso';

export default function Avisos() {
  const { isAutenticado, usuario } = useAuth();
  const { avisos, carregando, marcarComoVisualizado } = useAvisos();
  const { paginaAtual, totalPaginas, indiceInicial, indiceFinal, avisosPaginados, irParaPagina } = usePaginacao(avisos);
  const navigate = useNavigate();
  const { show } = useToast();

  const irParaLogin = () => {
    navigate('/acesso');
  };

  useEffect(() => {
    if (!isAutenticado || !usuario?.id) {
      return;
    }
  }, [isAutenticado, usuario?.id]);

  const handleClickAviso = async (aviso: Aviso) => {
    if (!aviso.visualizado) {
      try {
        await marcarComoVisualizado(aviso.id);
      } catch (error) {
        console.error('Erro ao marcar aviso como visualizado:', error);
      }
    }

    if (aviso.tarefaId && aviso.projetoId) {
      localStorage.setItem('projetoSelecionadoId', aviso.projetoId);
      navigate('/tarefas');
    } else if (aviso.projetoId) {
      navigate('/projetos');
    } else {
      show({ tipo: 'info', mensagem: 'Este aviso não está vinculado a uma tarefa ou projeto.' });
    }
  };

  if (!isAutenticado) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4 overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-red-600 flex flex-col gap-4">
              <span className="text-sm sm:text-base">Você precisa estar logado para ver os avisos.</span>
              <button
                onClick={irParaLogin}
                className="px-4 py-2 bg-azul-escuro text-white rounded hover:bg-azul-claro transition text-sm sm:text-base"
              >
                Fazer login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4 overflow-hidden">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-6 text-center text-azul-escuro flex-shrink-0">
          AVISOS
        </h1>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2">
          {carregando ? (
            <div className="text-center text-gray-500 mt-10">Carregando avisos...</div>
          ) : (
            <>
              {totalPaginas > 1 && (
                <div className="text-center text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 flex-shrink-0">
                  Exibindo {indiceInicial + 1} - {Math.min(indiceFinal, avisos.length)} de {avisos.length} avisos
                </div>
              )}

              <ListaAvisos
                avisos={avisosPaginados}
                usuarioId={usuario?.id}
                onClickAviso={handleClickAviso}
              />

              {totalPaginas > 1 && (
                <Paginacao
                  paginaAtual={paginaAtual}
                  totalPaginas={totalPaginas}
                  onMudarPagina={irParaPagina}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
