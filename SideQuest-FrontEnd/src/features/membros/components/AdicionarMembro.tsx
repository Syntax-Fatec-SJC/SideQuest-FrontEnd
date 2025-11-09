import type { FC } from 'react';
import type { LinhaEdicao, UsuarioResumo } from '../../../types/Membro';

interface AdicionarMembroProps {
  linhaEdicao: LinhaEdicao;
  setLinhaEdicao: React.Dispatch<React.SetStateAction<LinhaEdicao | null>>;
  usuariosDisponiveis: UsuarioResumo[];
  listaAberta: boolean;
  setListaAberta: React.Dispatch<React.SetStateAction<boolean>>;
  salvarLinha: () => void;
  cancelarEdicao: () => void;
  loadingAcao: boolean;
}

export const AdicionarMembro: FC<AdicionarMembroProps> = ({
  linhaEdicao,
  setLinhaEdicao,
  usuariosDisponiveis,
  listaAberta,
  setListaAberta,
  salvarLinha,
  cancelarEdicao,
  loadingAcao,
}) => {
  return (
    <div className="bg-[#F5F5F5] rounded-lg shadow p-4 mb-4 flex flex-col gap-2 relative">
      <input
        type="text"
        placeholder="Pesquisar usuário..."
        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        value={linhaEdicao?.nome || ''}
        onChange={e =>
          setLinhaEdicao((prev: LinhaEdicao | null) => {
            if (!prev) return null;
            return { ...prev, nome: e.target.value, usuarioIdSelecionado: undefined, erro: undefined };
          })
        }
        onFocus={() => setListaAberta(true)}
      />

      {listaAberta && usuariosDisponiveis.length > 0 && (
        <ul className="absolute top-full left-0 z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {usuariosDisponiveis
            .filter(
              u =>
                u.nome.toLowerCase().includes((linhaEdicao.nome || '').toLowerCase()) ||
                u.email.toLowerCase().includes((linhaEdicao.nome || '').toLowerCase())
            )
            .map(u => (
              <li
                key={u.id}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() =>
                  setLinhaEdicao((prev: LinhaEdicao | null) => {
                    if (!prev) return null;
                    return { ...prev, usuarioIdSelecionado: u.id, nome: u.nome, email: u.email, erro: undefined };
                  })
                }
              >
                {u.nome} - {u.email}
              </li>
            ))}
        </ul>
      )}

      {linhaEdicao.erro && <div className="text-sm text-red-600">{linhaEdicao.erro}</div>}

      <div className="flex gap-2 justify-end mt-2">
        <button onClick={cancelarEdicao} className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm">
          Cancelar
        </button>
        <button
          disabled={loadingAcao}
          onClick={salvarLinha}
          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          Salvar
        </button>
      </div>
    </div>
  );
};