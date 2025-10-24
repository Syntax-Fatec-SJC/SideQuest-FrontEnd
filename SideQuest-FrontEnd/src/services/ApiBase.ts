// src/services/ApiBase.ts
const DEFAULT_BASE = 'http://localhost:8080';
const BASE_URL = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || DEFAULT_BASE;

export class ApiBase {
  protected baseUrl = BASE_URL;

  protected getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Proteção adicional contra CSRF
    };

    // Adicionar token JWT se existir (fallback para compatibilidade)
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  protected async makeRequest<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const finalUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const response = await fetch(finalUrl, {
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        credentials: 'include', // IMPORTANTE: Envia cookies automaticamente
        ...options,
      });

      if (!response.ok) {
        // Se for 401 (não autorizado), limpar token e redirecionar para login
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          localStorage.removeItem('usuarioId');
          localStorage.removeItem('usuarioLogado');
          
          // Apenas redirecionar se não estiver já na página de login
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/acesso')) {
            window.location.href = '/acesso';
          }
        }
        
        const errorData = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorData}`);
      }

      if (response.status === 204) return null as unknown as T;

      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      // mantém log para dev, mas propaga o erro para o caller tratar
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // conveniências
  protected get<T = unknown>(url: string): Promise<T> {
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  protected post<T = unknown>(url: string, body?: unknown): Promise<T> {
    return this.makeRequest<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }

  protected put<T = unknown>(url: string, body?: unknown): Promise<T> {
    return this.makeRequest<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  }

  protected delete<T = unknown>(url: string): Promise<T> {
    return this.makeRequest<T>(url, { method: 'DELETE' });
  }
}
