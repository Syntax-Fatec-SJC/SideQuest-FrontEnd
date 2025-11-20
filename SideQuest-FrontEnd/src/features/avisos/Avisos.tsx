import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../shared/components/Sidebar';
import { MdOutlineAccessTime, MdOutlineArrowForward, MdOutlineErrorOutline, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import useAuth from '../../shared/hooks/useAuth';
import AvisoService from '../../services/AvisoService';
import type { Aviso } from '../../types/Aviso';
import { useToast } from '../../shared/hooks/useToast';

const AVISOS_POR_PAGINA = 7;

export default function Avisos() {
  const { isAutenticado, usuario } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const navigate = useNavigate();
  const { show } = useToast();

  const irParaLogin = () => {
    navigate('/acesso');
  };

  useEffect(() => {
    if (!isAutenticado || !usuario?.id) {
      setCarregando(false);
      return;
    }

    const carregarAvisos = async () => {
      try {
        setCarregando(true);
        const dados = await AvisoService.listarPorUsuario(usuario.id);
        setAvisos(dados);
      } catch (error) {
        console.error('Erro ao carregar avisos:', error);
        show({ tipo: 'erro', mensagem: 'Erro ao carregar avisos' });
      } finally {
        setCarregando(false);
      }
    };

    void carregarAvisos();
  }, [isAutenticado, usuario?.id, show]);

  const cores = {
    urgente: 'bg-red-200 border-red-300 text-gray-700',
    edicao: 'bg-orange-200 border-orange-300 text-gray-700',
    novo: 'bg-green-200 border-green-300 text-gray-700',
    atribuicao: 'bg-green-200 border-green-300 text-gray-700',
    exclusao: 'bg-red-200 border-red-300 text-gray-700',
  };

  const icones = {
    urgente: <MdOutlineAccessTime size={28} className="text-red-600" />,
    edicao: <MdOutlineErrorOutline size={28} className="text-orange-600" />,
    novo: (
      <div className="border-2 border-green-600 text-green-600 px-2 py-0.5 rounded text-xs font-bold">
        NEW
      </div>
    ),
    atribuicao: (
      <div className="border-2 border-green-600 text-green-600 px-2 py-0.5 rounded text-xs font-bold">
        NEW
      </div>
    ),
    exclusao: <MdOutlineAccessTime size={28} className="text-red-600" />,
  };

  const handleClickAviso = async (aviso: Aviso) => {
    try {
      // Marca como visualizado
      if (!aviso.visualizado) {
        await AvisoService.marcarComoVisualizado(aviso.id);
        setAvisos(prev =>
          prev.map(a =>
            a.id === aviso.id ? { ...a, visualizado: true } : a
          )
        );
      }

      // Navega para a tela correspondente
      if (aviso.tarefaId && aviso.projetoId) {
        // Salva o projeto selecionado e vai para tarefas
        localStorage.setItem('projetoSelecionadoId', aviso.projetoId);
        navigate('/tarefas');
      } else if (aviso.projetoId) {
        // Vai para projetos
        navigate('/projetos');
      }
    } catch (error) {
      console.error('Erro ao processar aviso:', error);
    }
  };

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const horaFormatada = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dataFormatada} às ${horaFormatada}`;
    } catch {
      return dataString;
    }
  };

  const formatarMensagem = (aviso: Aviso) => {
    if (aviso.autorId === usuario?.id && aviso.autorNome) {
      // Se o usuário é o autor, personaliza a mensagem
      let mensagemFormatada = aviso.mensagem.replace(aviso.autorNome, 'Você');
      
      // Para exclusões: "Você excluiu um projeto/tarefa."
      if (mensagemFormatada.includes('excluiu')) {
        mensagemFormatada = mensagemFormatada
          .replace('excluiu um projeto atrelado a você', 'excluiu um projeto')
          .replace('excluiu uma tarefa atrelada a você', 'excluiu uma tarefa');
      }
      
      // Para edições: "Você editou um projeto/tarefa."
      if (mensagemFormatada.includes('editou') || mensagemFormatada.includes('atualizou')) {
        mensagemFormatada = mensagemFormatada
          .replace('editou uma tarefa atrelada a você', 'editou uma tarefa')
          .replace('atualizou um projeto atrelado a você', 'editou um projeto');
      }
      
      // Para atribuições/criações
      if (mensagemFormatada.includes('atrelou')) {
        if (mensagemFormatada.includes('atrelou você')) {
          // Caso: "Você atrelou você a uma tarefa/projeto"
          if (aviso.usuarioId === usuario?.id) {
            // Usuário se atribuiu: "Você criou uma tarefa/projeto."
            mensagemFormatada = mensagemFormatada
              .replace('atrelou você a uma tarefa', 'criou uma tarefa')
              .replace('atrelou você a um projeto', 'criou um projeto');
          }
        } else {
          // Caso: "Você atrelou [Nome] a uma tarefa/projeto"
          // Mensagem já está formatada corretamente, mantém como está
        }
      }
      
      return mensagemFormatada;
    }
    return aviso.mensagem;
  };

  // Cálculos de paginação
  const totalPaginas = Math.ceil(avisos.length / AVISOS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * AVISOS_POR_PAGINA;
  const indiceFinal = indiceInicial + AVISOS_POR_PAGINA;
  const avisosPaginados = avisos.slice(indiceInicial, indiceFinal);

  const irParaPagina = (numeroPagina: number) => {
    setPaginaAtual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      irParaPagina(paginaAtual - 1);
    }
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      irParaPagina(paginaAtual + 1);
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
          ) : avisos.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Nenhum aviso encontrado.</div>
          ) : (
            <>
              {/* Informação de paginação */}
              {totalPaginas > 1 && (
                <div className="text-center text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 flex-shrink-0">
                  Exibindo {indiceInicial + 1} - {Math.min(indiceFinal, avisos.length)} de {avisos.length} avisos
                </div>
              )}

              {/* Lista de avisos */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-4">
                {avisosPaginados.map(aviso => (
                  <div
                    key={aviso.id}
                    onClick={() => void handleClickAviso(aviso)}
                    className={`relative flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 rounded-lg border-2 shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${cores[aviso.tipo]} w-full`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                        {icones[aviso.tipo]}
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="font-normal text-xs sm:text-sm md:text-base text-gray-700 break-words">
                          {formatarMensagem(aviso)}
                        </p>
                        {aviso.data && (
                          <span className="text-[10px] sm:text-xs text-gray-500 mt-1">{formatarData(aviso.data)}</span>
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
                ))}
              </div>

              {/* Controles de paginação */}
              {totalPaginas > 1 && (
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
                          onClick={() => irParaPagina(numeroPagina)}
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
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
