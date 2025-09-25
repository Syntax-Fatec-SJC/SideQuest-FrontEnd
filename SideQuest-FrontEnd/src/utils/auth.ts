// Utilitários para gerenciar autenticação local

const TOKEN_KEY = 'sidequest_token';
const USER_KEY = 'sidequest_user';

export const tokenUtils = {
  // Salvar token no localStorage
  saveToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Obter token do localStorage
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remover token do localStorage
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Verificar se existe token
  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Obter header de Authorization
  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? `Bearer ${token}` : null;
  }
};

export const userUtils = {
  // Salvar dados do usuário
  saveUser: (user: { id: string; nome: string; email?: string; provedor?: string; ativo?: boolean; dataCriacao?: string }) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Obter dados do usuário
  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Remover dados do usuário
  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // Limpar todos os dados de autenticação
  clearAuth: () => {
    tokenUtils.removeToken();
    localStorage.removeItem(USER_KEY);
  }
};