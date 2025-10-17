import CriarProjetoModal from "../CriarProjetoModal";
import Sidebar from "../../../shared/components/Sidebar";
import { EstadoPrincipal } from "./EstadoPrincipal";
import type { Projeto } from "../../../types/Projeto";

interface ProjetosViewProps {
  // Estados
  projetos: Projeto[];
  loading: boolean;
  erro: string | null;
  showModal: boolean;
  projetoSelecionadoId: string | null;
  creating: boolean;
  removendoId: string | null;
  
  // Funções
  carregarProjetos: () => void;
  criarProjeto: (dados: {
    nome: string;
    descricao?: string;
    usuarios?: string[];
    prazo: string;
  }) => Promise<void>;
  excluirProjeto: (id: string, ev?: React.MouseEvent<HTMLButtonElement>) => void;
  selecionar: (id: string) => void;
  abrirModal: () => void;
  fecharModal: () => void;
}

/**
 * Componente de UI puro para a visualização de projetos.
 * Apenas renderiza a interface, não contém lógica de negócio.
 */
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
  return (
    <div className="flex h-screen relative">
      <Sidebar />
      <div className="flex-1 bg-white rounded-3xl overflow-auto p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 text-center text-azul-escuro">
          Gerenciar Projetos
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1100px]">
          <EstadoPrincipal
            loading={loading}
            erro={erro}
            projetos={projetos}
            projetoSelecionadoId={projetoSelecionadoId}
            removendoId={removendoId}
            creating={creating}
            onCarregarProjetos={carregarProjetos}
            onSelecionar={selecionar}
            onExcluir={excluirProjeto}
            onAbrirModal={abrirModal}
          />
        </div>
        <CriarProjetoModal
          isOpen={showModal}
          onClose={fecharModal}
          onCreate={criarProjeto} 
        />
      </div>
    </div>
  );
}