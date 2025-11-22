import { MdOutlineAccessTime, MdOutlineErrorOutline } from 'react-icons/md';

/**
 * Configurações de cores e ícones para os tipos de avisos
 */

export const cores = {
  urgente: 'bg-red-200 border-red-300 text-gray-700',
  edicao: 'bg-orange-200 border-orange-300 text-gray-700',
  novo: 'bg-green-200 border-green-300 text-gray-700',
  atribuicao: 'bg-green-200 border-green-300 text-gray-700',
  exclusao: 'bg-red-200 border-red-300 text-gray-700',
} as const;

export const icones = {
  urgente: <MdOutlineAccessTime size={28} className="text-red-600" />,
  edicao: <MdOutlineErrorOutline size={28} className="text-orange-600" />,
  novo: (
    <div className="border-2 border-green-600 text-green-600 px-2 py-0.5 rounded text-xs font-bold">
      NEW
    </div>
  ),
  atribuicao: (
    <div className="border-2 border-green-600 text-green-600 px-2 py-0.5 rounded text-xs font-bold">
      NEW
    </div>
  ),
  exclusao: <MdOutlineAccessTime size={28} className="text-red-600" />,
} as const;

export type TipoAviso = keyof typeof cores;
