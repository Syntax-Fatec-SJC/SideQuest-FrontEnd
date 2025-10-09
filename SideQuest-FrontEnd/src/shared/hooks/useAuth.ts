import { useCallback, useEffect, useState } from 'react';

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
}

function lerUsuarioLocalStorage(): UsuarioSessao | null {
  const ordemChaves = ['usuarioLogado', 'usuario', 'usuarioSessao'];
  for (const chave of ordemChaves) {
    const raw = localStorage.getItem(chave);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (obj && obj.id && obj.email) return obj;
      } catch {
      }
    }
  }
  const idDireto = localStorage.getItem('usuarioId');
  if (idDireto) {
    return { id: idDireto, nome: 'Usuário', email: '' };
  }
  return null;
}

export function useAuth() {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(() => lerUsuarioLocalStorage());

  const refresh = useCallback(() => {
    setUsuario(lerUsuarioLocalStorage());
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioSessao');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('projetoSelecionadoId');
    setUsuario(null);
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (['usuarioLogado','usuario','usuarioSessao','usuarioId'].includes(e.key || '')) {
        refresh();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  return { usuario, isAutenticado: !!usuario?.id, refresh, logout };
}

export default useAuth;