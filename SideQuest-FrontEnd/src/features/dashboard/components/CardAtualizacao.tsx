import type { AtualizacaoItem } from "../../../types/Dashboard";
import { AtualizacaoItemCard } from "../components/ui/AtualizacaoItemCard";

interface CardAtualizacaoProps {
  atualizacoes: AtualizacaoItem[];
  className?: string;
  maxVisible?: number;
}

export function CardAtualizacao({
  atualizacoes,
  className = "",
  maxVisible = 4
}: CardAtualizacaoProps) {
  const scrollAtivo = atualizacoes.length > maxVisible;
  const alturaMax = scrollAtivo ? `${maxVisible * 120}px` : "auto";

  return (
    <div className={`bg-white mb-4 rounded-3xl p-6 flex flex-col gap-4 w-full shadow-sm ${className}`}>
      <h2 className="text-2xl font-semibold text-[#1D428A] mb-4 text-center">
        ATUALIZAÇÕES
      </h2>

      <div
        className={`flex flex-col gap-4 pr-2 ${scrollAtivo ? "overflow-y-auto" : ""}`}
        style={{ maxHeight: alturaMax }}
      >
        {atualizacoes.map((item, index) => (
          <AtualizacaoItemCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
