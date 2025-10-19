// src/services/ApiBase.ts
const DEFAULT_BASE = 'http://localhost:8080';
const BASE_URL = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || DEFAULT_BASE;

export class ApiBase {
  protected baseUrl = BASE_URL;

  protected async makeRequest<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const finalUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const response = await fetch(finalUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
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
