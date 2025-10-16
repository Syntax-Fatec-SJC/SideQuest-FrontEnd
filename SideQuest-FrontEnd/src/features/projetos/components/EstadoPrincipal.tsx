import { FaFolderPlus, FaFolder, FaTrash, FaSyncAlt } from "react-icons/fa";
import type { Projeto } from "../../../types/Projeto";

interface EstadoPrincipalProps {
  loading: boolean;
  erro: string | null;
  projetos: Projeto[];
  projetoSelecionadoId: string | null;
  removendoId: string | null;
  creating: boolean;
  onCarregarProjetos: () => void;
  onSelecionar: (id: string) => void;
  onExcluir: (id: string, ev?: React.MouseEvent<HTMLButtonElement>) => void;
  onAbrirModal: () => void;
}

export function EstadoPrincipal({
  loading,
  erro,
  projetos,
  projetoSelecionadoId,
  removendoId,
  creating,
  onCarregarProjetos,
  onSelecionar,
  onExcluir,
  onAbrirModal,
}: EstadoPrincipalProps) {

  const BotaoNovoProjeto = (
    !loading && !erro && (
      <button
        onClick={onAbrirModal}
        disabled={creating}
        className="w-full h-44 sm:h-52 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-cinza-claro text-cinza-claro bg-white hover:bg-pastel hover:text-cinza-medio transition disabled:opacity-50"
      >
        <FaFolderPlus className="text-6xl sm:text-8xl mb-2 sm:mb-3" />
        <span className="text-base sm:text-lg">
          {creating ? "Criando..." : "Novo Projeto"}
        </span>
      </button>
    )
  );

  if (loading) {
    return (
      <div className="col-span-full text-center text-cinza-claro flex flex-col items-center gap-4 py-16">
        <FaSyncAlt className="animate-spin text-3xl" />
        <span>Carregando projetos...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="col-span-full text-center text-red-600 flex flex-col gap-4 py-16">
        <span>{erro}</span>
        <button
          onClick={onCarregarProjetos}
          className="px-4 py-2 bg-azul-escuro text-white rounded hover:bg-azul-claro transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!projetos.length) {
    return (
      <>
        <div className="col-span-full text-cinza-claro flex flex-col items-center justify-center gap-2 py-2">
          <span>Nenhum projeto ainda. Crie o primeiro!</span>
        </div>
        {BotaoNovoProjeto}
      </>
    );
  }

  return (
    <>
      {projetos.map(projeto => {
        const selecionado = projetoSelecionadoId === projeto.id;
        return (
          <div
            key={projeto.id}
            onClick={() => onSelecionar(projeto.id)}
            className={`group relative cursor-pointer w-full h-44 sm:h-52 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6 bg-pastel shadow-md transition border-2 ${
              selecionado 
                ? 'border-azul-escuro ring-2 ring-azul-escuro/40' 
                : 'border-transparent hover:shadow-lg'
            }`}
          >
            <button
              onClick={(e) => onExcluir(projeto.id, e as React.MouseEvent<HTMLButtonElement>)}
              disabled={removendoId === projeto.id}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-red-600 hover:text-red-700 bg-white/70 rounded px-2 py-1 text-xs"
            >
              {removendoId === projeto.id ? "..." : <FaTrash />}
            </button>
            <FaFolder className="text-cinza-medio text-6xl sm:text-8xl mb-2 sm:mb-3" />
            <span className="text-base sm:text-lg text-cinza-claro font-bold text-center line-clamp-2">
              {projeto.nome}
            </span>
            <span className="mt-1 text-xs uppercase tracking-wide text-cinza-medio">
              {projeto.status}
            </span>
          </div>
        );
      })}
      {BotaoNovoProjeto}
    </>
  );
}