import CriarProjetoModal from "./CriarProjetoModal";
import Sidebar from "../../../shared/components/Sidebar";
import { FaFolderPlus, FaFolder, FaTrash } from "react-icons/fa";
import type { Projeto } from "../../../types/Projeto";

interface ProjetosViewProps {
  projetos: Projeto[];
  loading: boolean;
  erro: string | null;
  showModal: boolean;
  projetoSelecionadoId: string | null;
  creating: boolean;
  removendoId: string | null;

  carregarProjetos: () => void;
  criarProjeto: (dados: { nome: string; descricao?: string; usuarios?: string[]; prazo: string }) => Promise<void>;
  excluirProjeto: (id: string, ev?: React.MouseEvent<HTMLButtonElement>) => void;
  selecionar: (id: string) => void;
  abrirModal: () => void;
  fecharModal: () => void;
}

export function ProjetosView({
  projetos,
  loading,
  erro,
  showModal,
  projetoSelecionadoId,
  creating,
  removendoId,
  carregarProjetos,
  criarProjeto,
  excluirProjeto,
  selecionar,
  abrirModal,
  fecharModal
}: ProjetosViewProps) {

  const BotaoNovoProjeto = !loading && !erro && (
    <button
      onClick={abrirModal}
      disabled={creating}
      className="w-full h-44 sm:h-52 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-cinza-claro text-cinza-claro bg-white hover:bg-pastel hover:text-cinza-medio transition disabled:opacity-50"
    >
      <FaFolderPlus className="text-6xl sm:text-8xl mb-2 sm:mb-3" />
      <span className="text-base sm:text-lg">
        {creating ? "Criando..." : "Novo Projeto"}
      </span>
    </button>
  );

  return (
    <div className="flex h-screen relative">
      <Sidebar />

      <main className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 text-center text-azul-escuro">
          Gerenciar Projetos
        </h1>

        <div className="flex-1 h-[calc(90vh-160px)] overflow-auto pb-16 sm:h-auto sm:overflow-visible sm:pb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1100px]">

            

            {/* Erro */}
            {erro && !loading && (
              <div className="col-span-full text-center text-red-600 flex flex-col gap-4 py-16">
                <span>{erro}</span>
                <button
                  onClick={carregarProjetos}
                  className="px-4 py-2 bg-azul-escuro text-white rounded hover:bg-azul-claro transition"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && !erro && projetos.length === 0 && (
              <>
                <div className="col-span-full text-cinza-claro flex flex-col items-center justify-center gap-2 py-2">
                  <span>Nenhum projeto ainda. Crie o primeiro!</span>
                </div>
                {BotaoNovoProjeto}
              </>
            )}

            {!loading && !erro && projetos.map(projeto => {
              const selecionado = projetoSelecionadoId === projeto.id;
              return (
                <div
                  key={projeto.id}
                  onClick={() => selecionar(projeto.id)}
                  className={`group relative cursor-pointer w-full h-44 sm:h-52 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6 bg-pastel shadow-md transition border-2 ${selecionado
                    ? 'border-azul-escuro ring-2 ring-azul-escuro/40'
                    : 'border-transparent hover:shadow-lg'
                  }`}
                >
                  <span
                    className={`absolute top-3 left-3 w-3 h-3 rounded-full
                      ${projeto.status === 'ATIVO' ? 'bg-yellow-400' : ''}
                      ${projeto.status === 'CONCLUIDO' ? 'bg-green-500' : ''}
                    `}
                    title={`Status: ${projeto.status}`}
                  ></span>

                  <button
                    onClick={(e) => { e.stopPropagation(); excluirProjeto(projeto.id, e); }}
                    disabled={removendoId === projeto.id}
                    className={`absolute top-2 right-2 px-2 py-1 text-xs rounded bg-white/70 text-red-600 hover:text-red-700 transition ${removendoId === projeto.id ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"}`}
                  >
                    {removendoId === projeto.id ? "..." : <FaTrash />}
                  </button>

                  <FaFolder className="text-cinza-medio text-6xl sm:text-8xl mb-2 sm:mb-3" />
                  <span className="text-base sm:text-lg text-cinza-claro font-bold text-center line-clamp-2">
                    {projeto.nome}
                  </span>
                </div>
              );
            })}

            {!loading && !erro && projetos.length > 0 && BotaoNovoProjeto}

          </div>
        </div>

        <CriarProjetoModal
          isOpen={showModal}
          onClose={fecharModal}
          onCreate={criarProjeto}
        />
      </main>
    </div>
  );
}
