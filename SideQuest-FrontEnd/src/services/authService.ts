import type { LoginData, CadastroData, AuthResponse, CadastroResponse, Usuario, ErrorResponse } from '../types/auth';
import { tokenUtils } from '../utils/auth';

// Em desenvolvimento usa o proxy do Vite, em produção usa a URL completa
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8080/api';

// Classe para tratamento de erros da API
class ApiError extends Error {
  status: number;
  data?: ErrorResponse;
  
  constructor(status: number, message: string, data?: ErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Função auxiliar para fazer requisições
const fetchApi = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Adiciona headers customizados
  if (options.headers) {
    Object.assign(defaultHeaders, options.headers);
  }

  // Adiciona token de autorização se existir
  const authHeader = tokenUtils.getAuthHeader();
  if (authHeader) {
    defaultHeaders['Authorization'] = authHeader;
  }

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  return response;
};

// Função para tratar respostas da API
const handleResponse = async <T>(response: Response): Promise<T> => {
  try {
    if (!response.ok) {
      let errorData: ErrorResponse = {};
      
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Erro ao parsear resposta de erro:', parseError);
        // Se não conseguir parsear, usa uma mensagem padrão
        errorData = { message: `Erro ${response.status}: ${response.statusText}` };
      }

      const apiError = new ApiError(
        response.status,
        errorData.message || errorData.erro || `Erro ${response.status}`,
        errorData
      );
      
      console.error('ApiError:', apiError);
      throw apiError;
    }

    const text = await response.text();
    const result = text ? JSON.parse(text) : ({} as T);
    console.log('Resposta da API processada:', result);
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Erro inesperado no handleResponse:', error);
    throw new ApiError(500, 'Erro inesperado na comunicação com o servidor', {});
  }
};

export const authService = {
  // Verificar status da API
  checkStatus: async (): Promise<string> => {
    const response = await fetchApi('/auth/status');
    return handleResponse<string>(response);
  },

  // Fazer login
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    const response = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    return handleResponse<AuthResponse>(response);
  },

  // Fazer cadastro
  cadastro: async (cadastroData: CadastroData): Promise<CadastroResponse> => {
    try {
      console.log('Enviando requisição de cadastro para:', cadastroData.email);
      
      const response = await fetchApi('/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify(cadastroData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const result = await handleResponse<CadastroResponse>(response);
      console.log('Cadastro bem-sucedido:', result.mensagem);
      
      return result;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  },

  // Obter perfil do usuário (endpoint protegido)
  getPerfil: async (): Promise<Usuario> => {
    const response = await fetchApi('/usuarios/perfil');
    return handleResponse<Usuario>(response);
  },

  // Obter dashboard (endpoint protegido)
  getDashboard: async (): Promise<{ mensagem: string; descricao: string }> => {
    const response = await fetchApi('/usuarios/dashboard');
    return handleResponse<{ mensagem: string; descricao: string }>(response);
  },

  // Iniciar login com Google
  loginWithGoogle: () => {
    
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  },

  // Solicitar reset de senha
  solicitarResetSenha: async (email: string): Promise<string> => {
    const response = await fetchApi('/auth/solicitar-reset-senha', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    
    // O endpoint retorna texto simples, não JSON
    return response.text();
  },

  // Redefinir senha
  redefinirSenha: async (token: string, novaSenha: string): Promise<string> => {
    const response = await fetchApi('/auth/redefinir-senha', {
      method: 'POST',
      body: JSON.stringify({ token, novaSenha })
    });
    
    // O endpoint retorna texto simples, não JSON
    return response.text();
  }
};

export { ApiError };