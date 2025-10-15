import CriarProjetoModal from "./CriarProjetoModal";
import Sidebar from "../../shared/components/Sidebar";
import { useProjetos } from "./hooks/useProjetos";
import { EstadoPrincipal } from "./components/EstadoPrincipal";

export default function GerenciarProjetos() {
  const {
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
  } = useProjetos();

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
