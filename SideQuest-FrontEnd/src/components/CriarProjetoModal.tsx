import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nome: string) => void;
}

export default function CriarProjetoModal({ isOpen, onClose, onCreate }: Props) {
  const [nomeProjeto, setNomeProjeto] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!nomeProjeto.trim()) return;
    onCreate(nomeProjeto);
    setNomeProjeto("");
  };

  return (
    <div className="absolute -top-64 left-1/2 transform -translate-x-1/2 w-72 p-6  bg-white rounded-xl shadow-lg z-50">
      <h2 className="font-bold text-azul-escuro mb-4 text-center text-lg">
        Novo Projeto
      </h2>

      <input
        type="text"
        placeholder="Nome do projeto"
        className="w-full rounded-lg border border-cinza-borda px-3 py-2 mb-4 
                   focus:outline-none focus:ring-2 focus:ring-azul-claro text-azul-escuro"
        value={nomeProjeto}
        onChange={(e) => setNomeProjeto(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 rounded-lg bg-gray-200 text-azul-escuro 
                     hover:bg-gray-300 transition"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 rounded-lg text-white font-medium
                     bg-azul-escuro hover:bg-azul-claro transition"
          onClick={handleCreate}
        >
          Criar
        </button>
      </div>
    </div>
  );
}
