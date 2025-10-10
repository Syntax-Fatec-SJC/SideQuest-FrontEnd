import { useState, useRef, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nome: string) => void;
}

export default function CriarProjetoModal({ isOpen, onClose, onCreate }: Props) {
  const [nomeProjeto, setNomeProjeto] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!nomeProjeto.trim()) return;
    onCreate(nomeProjeto.trim());
    setNomeProjeto("");
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-lg animate-[fadeIn_.18s_ease-out]">
        <h2 className="font-bold text-azul-escuro mb-4 text-center text-lg">
          Novo Projeto
        </h2>

        <input
          ref={inputRef}
          type="text"
          placeholder="Nome do projeto"
          className="w-full rounded-lg border border-cinza-borda px-3 py-2 mb-4 
                     focus:outline-none focus:ring-2 focus:ring-azul-claro text-azul-escuro"
          value={nomeProjeto}
          onChange={(e) => setNomeProjeto(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
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
            className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed
                       bg-azul-escuro hover:bg-azul-claro transition"
            onClick={handleCreate}
            disabled={!nomeProjeto.trim()}
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
