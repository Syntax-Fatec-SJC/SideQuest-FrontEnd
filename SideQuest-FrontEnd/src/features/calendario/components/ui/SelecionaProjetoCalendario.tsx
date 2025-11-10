import { useEffect } from "react";
import type { Projeto } from "../../../../types/Projeto";

interface ProjetoSelectProps {
  projetos: Projeto[];
  valorSelecionado: string | null;
  onChange: (id: string | null) => void;
  carregando?: boolean;
  desabilitado?: boolean;
}

export function ProjetoSelect({
  projetos,
  valorSelecionado,
  onChange,
  carregando = false,
  desabilitado = false,
}: ProjetoSelectProps) {
  const estaDesabilitado = carregando || desabilitado;

  useEffect(() => {
    if (!valorSelecionado && projetos.length > 0) {
      onChange(projetos[0].id);
    }
  }, [projetos, valorSelecionado, onChange]);

  return (
    <select
      value={valorSelecionado ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={estaDesabilitado}
      className="p-2 border rounded-md shadow-sm focus:ring-azul-escuro focus:border-azul-escuro
                 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
    >
      {projetos.length === 0 ? (
        <option value="">Nenhum projeto disponível</option>
      ) : (
        <>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </>
      )}
    </select>
  );
}
