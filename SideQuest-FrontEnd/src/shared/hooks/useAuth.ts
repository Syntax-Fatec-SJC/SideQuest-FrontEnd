import { useCallback, useEffect, useState, useRef } from 'react';

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
        // Ignora JSON inválido
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
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(() =>
    lerUsuarioLocalStorage()
  );

  // Ref para evitar setUsuario redundante
  const ultimoUsuarioRef = useRef<UsuarioSessao | null>(usuario);

  const refresh = useCallback(() => {
    const novoUsuario = lerUsuarioLocalStorage();
    // Só atualiza se mudou
    if (
      novoUsuario?.id !== ultimoUsuarioRef.current?.id ||
      novoUsuario?.email !== ultimoUsuarioRef.current?.email
    ) {
      ultimoUsuarioRef.current = novoUsuario;
      setUsuario(novoUsuario);
    }
  }, []);

  const logout = useCallback(async () => {
    // Não chamar o servidor - apenas limpar localStorage localmente
    // O backend não possui endpoint /logout nos microserviços
    const chavesParaRemover = [
      'usuarioLogado',
      'usuario',
      'usuarioSessao',
      'usuarioId',
      'projetoSelecionadoId',
      'token',
    ];
    chavesParaRemover.forEach((chave) => localStorage.removeItem(chave));
    ultimoUsuarioRef.current = null;
    setUsuario(null);
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (['usuarioLogado', 'usuario', 'usuarioSessao', 'usuarioId'].includes(e.key || '')) {
        refresh();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  return { usuario, isAutenticado: !!usuario?.id, refresh, logout };
}

export default useAuth;
