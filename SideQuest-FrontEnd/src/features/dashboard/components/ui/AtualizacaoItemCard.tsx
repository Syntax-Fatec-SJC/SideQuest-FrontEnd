import { FaUser, FaCalendarAlt } from "react-icons/fa";
import type { AtualizacaoItem } from "../../../../types/Dashboard";

interface AtualizacaoItemCardProps {
  item: AtualizacaoItem;
}

export function AtualizacaoItemCard({ item }: AtualizacaoItemCardProps) {
  return (
    <div className="bg-[#F2E9E9] p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
      <div className="font-medium text-gray-800">{item.titulo}</div>
      <div className="text-sm text-gray-600">{item.descricao}</div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <FaCalendarAlt className="text-gray-600" /> {item.data}
        </span>
        <span className="flex items-center gap-1">
          {Array.isArray(item.responsavel)
            ? item.responsavel.join(", ")
            : item.responsavel}{" "}
          <FaUser className="text-gray-600" />
        </span>
      </div>
    </div>
  );
}
