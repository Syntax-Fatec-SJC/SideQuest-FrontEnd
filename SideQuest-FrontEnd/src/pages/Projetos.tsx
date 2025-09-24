import { useState } from "react";
import { FaFolderPlus, FaFolder } from "react-icons/fa";
import CriarProjetoModal from "../components/CriarProjetoModal";
import Sidebar from "../components/Sidebar";

interface Projeto {
  id: number;
  titulo: string;
}

const projetosIniciais: Projeto[] = [
  { id: 1, titulo: "Projeto A" },
  { id: 2, titulo: "Projeto B" },
  { id: 3, titulo: "Projeto C" },
  { id: 4, titulo: "Projeto D" },
  { id: 5, titulo: "Projeto E" },
];

export default function GerenciarProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosIniciais);
  const [showModal, setShowModal] = useState(false);

  const criarProjeto = (nome: string) => {
    setProjetos([...projetos, { id: projetos.length + 1, titulo: nome }]);
    setShowModal(false);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />

      <div className="flex-1 bg-white rounded-3xl overflow-auto p-8 shadow-lg mt-8 mb-8 mx-4 custom-scrollbar">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-azul-escuro">
          GERENCIAR PROJETOS
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1100px]">
          {projetos.map((projeto) => (
            <div
              key={projeto.id}
              className="w-full h-44 sm:h-52 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6 
                         bg-pastel shadow-md hover:shadow-lg transition"
            >
              <FaFolder className="text-cinza-medio text-6xl sm:text-8xl mb-2 sm:mb-3" />
              <span className="text-base sm:text-lg text-cinza-claro font-bold text-center">
                {projeto.titulo}
              </span>
            </div>
          ))}

          <div className="relative">
            <button
              onClick={() => setShowModal(true)}
              className="w-full h-44 sm:h-52 rounded-lg flex flex-col items-center justify-center p-4 sm:p-6
                         border-2 border-dashed border-cinza-claro text-cinza-claro
                         bg-white hover:bg-pastel hover:text-cinza-medio transition 
                         "
            >
              <FaFolderPlus className="text-6xl sm:text-8xl mb-2 sm:mb-3" />
              <span className="text-base sm:text-lg">Novo Projeto</span>
            </button>

            <div className="absolute top-full mt-2 right-0 z-50">
              <CriarProjetoModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onCreate={criarProjeto}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
