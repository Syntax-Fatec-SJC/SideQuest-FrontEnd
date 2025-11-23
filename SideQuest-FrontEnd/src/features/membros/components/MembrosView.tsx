import Sidebar from "../../../shared/components/Sidebar";
import { MembroCard } from "../components/MembroCard";
import { AdicionarMembro } from "../components/AdicionarMembro";
import type { LinhaEdicao, UsuarioResumo, MembroProjeto } from "../../../types/Membro";

interface MembrosViewProps {
  projetoSelecionadoId: string | null;
  busca: string;
  setBusca: (valor: string) => void;
  paginaAtual: number;
  setPaginaAtual: (num: number) => void;
  totalPaginas: number;
  membrosNaPagina: MembroProjeto[];
  linhaEdicao: LinhaEdicao | null;
  setLinhaEdicao: React.Dispatch<React.SetStateAction<LinhaEdicao | null>>;
  usuariosDisponiveis: UsuarioResumo[];
  listaAberta: boolean;
  setListaAberta: React.Dispatch<React.SetStateAction<boolean>>;
  iniciarEdicao: () => void;
  cancelarEdicao: () => void;
  salvarLinha: () => void;
  removerMembro: (usuarioId: string) => void;
  confirmandoRemocaoId: string | null;
  setConfirmandoRemocaoId: (id: string | null) => void;
  loadingLista: boolean;
  loadingAcao: boolean;
}

export function MembrosView({
  projetoSelecionadoId,
  busca,
  setBusca,
  paginaAtual,
  setPaginaAtual,
  totalPaginas,
  membrosNaPagina,
  linhaEdicao,
  setLinhaEdicao,
  usuariosDisponiveis,
  listaAberta,
  setListaAberta,
  iniciarEdicao,
  cancelarEdicao,
  salvarLinha,
  removerMembro,
  confirmandoRemocaoId,
  setConfirmandoRemocaoId,
  loadingLista,
  loadingAcao
}: MembrosViewProps) {
  return (
    <div className="flex h-screen relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">
          MEMBROS DO PROJETO
        </h1>

        {!projetoSelecionadoId && (
          <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded mb-4">
            Selecione um projeto na página de Projetos.
          </div>
        )}

        <div className="flex justify-between mb-6">
          <input
            placeholder="Pesquisar..."
            className="p-2 w-64 rounded-md border border-gray-300"
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
          />
          <button
            onClick={() => {
              iniciarEdicao();
              setListaAberta(true);
            }}
            disabled={!projetoSelecionadoId || !!linhaEdicao || loadingLista}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            + Novo Membro
          </button>
        </div>

        {linhaEdicao && (
          <AdicionarMembro
            linhaEdicao={linhaEdicao}
            setLinhaEdicao={setLinhaEdicao}
            usuariosDisponiveis={usuariosDisponiveis}
            listaAberta={listaAberta}
            setListaAberta={setListaAberta}
            salvarLinha={salvarLinha}
            cancelarEdicao={cancelarEdicao}
            loadingAcao={loadingAcao}
          />
        )}

        <div className="space-y-2 overflow-auto">
          {membrosNaPagina.length === 0 ? (
            <div className="text-center text-gray-500">Nenhum membro.</div>
          ) : (
            membrosNaPagina.map(m => (
              <MembroCard
                key={m.usuarioId}
                membro={m}
                confirmandoRemocaoId={confirmandoRemocaoId}
                setConfirmandoRemocaoId={setConfirmandoRemocaoId}
                removerMembro={removerMembro}
                loadingAcao={loadingAcao}
              />
            ))
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => setPaginaAtual(Math.max(paginaAtual - 1, 1))}
              disabled={paginaAtual === 1}
              className="px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              ‹
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPaginaAtual(num)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  paginaAtual === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setPaginaAtual(Math.min(paginaAtual + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
              className="px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              ›
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
