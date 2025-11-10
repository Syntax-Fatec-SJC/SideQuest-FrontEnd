import { useState, useRef, useEffect } from "react";
import { useToast } from "../../../shared/hooks/useToast";
import { useUsuariosProjeto } from "../hooks/useUsuarios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    nome: string;
    prazo: string;
    status: string;
    usuarioIdCriador: string;
    descricao?: string;
    usuarios?: string[];
  }) => void;
}

export default function CriarProjetoModal({ isOpen, onClose, onCreate }: Props) {
  const { show } = useToast();
  const { usuariosAdicionados, resetUsuarios } = useUsuariosProjeto();

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!nomeProjeto.trim()) {
      show({ tipo: "erro", mensagem: "O nome do projeto é obrigatório." });
      return;
    }

    if (!prazo.trim()) {
      show({ tipo: "erro", mensagem: "O prazo do projeto é obrigatório." });
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataPrazo = new Date(prazo + "T00:00:00");
    if (dataPrazo < hoje) {
      show({ tipo: "erro", mensagem: "O prazo não pode ser uma data anterior a hoje." });
      return;
    }

    const usuarioIdCriador = "id-do-usuario-logado"; 

    if (!usuarioIdCriador) {
      show({ tipo: "erro", mensagem: "Usuário não autenticado. Faça login novamente." });
      return;
    }

    onCreate({
      nome: nomeProjeto.trim(),
      prazo,
      status: "A fazer",
      usuarioIdCriador,
      ...(descricao && { descricao }),
      ...(usuariosAdicionados.length > 0 && { usuarios: usuariosAdicionados.map(u => u.email) }),
    });

    setNomeProjeto("");
    setDescricao("");
    setPrazo("");
    resetUsuarios();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) onClose();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl p-6 sm:p-8 bg-white rounded-xl shadow-lg animate-[fadeIn_.18s_ease-out] space-y-6">

        <div>
          <label className="block mb-2 font-medium text-azul-escuro">
            Nome do Projeto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Digite o nome do projeto"
            className="w-full px-3 py-3 sm:py-4 text-azul-escuro border-none focus:outline-none focus:ring-2 focus:ring-azul-claro text-base sm:text-lg rounded-lg"
            value={nomeProjeto}
            onChange={(e) => setNomeProjeto(e.target.value)}
            ref={inputRef}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-azul-escuro">
              Prazo <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 text-azul-escuro bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-claro border-none"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4">
          <label className="block mb-2 font-medium text-azul-escuro">
            Descrição <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            placeholder="Descrição do projeto"
            className="w-full resize-none h-24 sm:h-32 px-3 py-2 rounded-lg text-azul-escuro focus:outline-none focus:ring-2 focus:ring-azul-claro border-none text-sm sm:text-base"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end sm:justify-between gap-3 mt-4">
          <button
            className="w-full sm:w-auto px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="w-full sm:w-auto px-6 py-2 rounded-lg bg-azul-escuro text-white hover:bg-azul-claro transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreate}
            disabled={!nomeProjeto.trim() || !prazo.trim()}
          >
            Salvar
          </button>
        </div>

      </div>
    </div>
  );
}