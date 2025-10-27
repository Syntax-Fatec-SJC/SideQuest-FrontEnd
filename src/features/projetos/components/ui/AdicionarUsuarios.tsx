import { FaUser, FaTimes } from "react-icons/fa";
import type { UsuarioResumo } from "../../../../types/Auth";

interface AdicionarUsuariosProps {
  usuariosAdicionados: UsuarioResumo[];
  emailDigitado: string;
  setEmailDigitado: (email: string) => void;
  onAddUsuario: () => void;
  onRemoveUsuario: (email: string) => void;
}

export default function AdicionarUsuarios({
  usuariosAdicionados,
  emailDigitado,
  setEmailDigitado,
  onAddUsuario,
  onRemoveUsuario,
}: AdicionarUsuariosProps) {
  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-azul-escuro font-medium">
        <FaUser /> Responsável <span className="text-gray-400">(opcional)</span>
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="E-mail do usuário para adicionar"
          className="flex-1 rounded-lg px-3 py-2 text-azul-escuro focus:outline-none focus:ring-2 focus:ring-azul-claro border-none"
          value={emailDigitado}
          onChange={(e) => setEmailDigitado(e.target.value)}
        />
        <button
          onClick={onAddUsuario}
          className="px-4 py-2 bg-azul-escuro text-white rounded-lg hover:bg-azul-claro transition"
        >
          Adicionar
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-32 overflow-y-auto mt-2">
        {usuariosAdicionados.length === 0 ? (
          <span className="text-gray-400">Nenhum usuário adicionado</span>
        ) : (
          usuariosAdicionados.map((u) => (
            <div
              key={u.email}
              className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg text-azul-escuro"
            >
              <span>
                {u.nome} ({u.email})
              </span>
              <button
                onClick={() => onRemoveUsuario(u.email)}
                className="text-red-500 hover:text-red-700"
                title="Remover"
              >
                <FaTimes />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
