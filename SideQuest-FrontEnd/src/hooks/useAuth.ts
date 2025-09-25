import { useState, useEffect } from 'react';
import { tokenUtils, userUtils } from '../utils/auth';
import { authService } from '../services/authService';
import type { Usuario } from '../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; nome: string } | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  // Função para fazer login
  const login = (token: string, user: { id: string; nome: string }) => {
    tokenUtils.saveToken(token);
    userUtils.saveUser(user);
    setAuthState({
      isAuthenticated: true,
      user,
      loading: false,
    });
  };

  // Função para fazer logout
  const logout = () => {
    userUtils.clearAuth();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  // Função para verificar o perfil do usuário
  const checkProfile = async (): Promise<Usuario | null> => {
    if (!tokenUtils.hasToken()) return null;
    
    try {
      return await authService.getPerfil();
    } catch {
      // Se der erro, provavelmente o token expirou
      logout();
      return null;
    }
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      const token = tokenUtils.getToken();
      const user = userUtils.getUser();
      
      if (token && user) {
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkProfile,
  };
};