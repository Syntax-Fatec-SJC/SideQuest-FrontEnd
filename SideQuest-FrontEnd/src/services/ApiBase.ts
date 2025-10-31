// src/services/ApiBase.ts
const DEFAULT_BASE = 'http://localhost:8080';

export class ApiBase {
  protected baseUrl = import.meta.env.VITE_API_URL ?? DEFAULT_BASE;
  protected token?: string;

  protected async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: unknown
  ): Promise<T> {
    const fullUrl = this.baseUrl + url;

    const resp = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include'
    });

    // Trata erro primeiro
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Erro HTTP ${resp.status}: ${text}`);
    }

    // Sem corpo: 204/205 ou Content-Length: 0
    if (resp.status === 204 || resp.status === 205) {
      return undefined as unknown as T;
    }
    const contentLength = resp.headers.get('content-length');
    if (contentLength === '0') {
      return undefined as unknown as T;
    }

    // Só parseia JSON se o content-type indicar JSON e houver texto
    const contentType = resp.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return undefined as unknown as T;
    }

    const text = await resp.text();
    if (!text) {
      return undefined as unknown as T;
    }

    return JSON.parse(text) as T;
  }

  protected get<T>(url: string) {
    return this.makeRequest<T>('GET', url);
  }
  protected post<T>(url: string, body?: unknown) {
    return this.makeRequest<T>('POST', url, body);
  }
  protected put<T>(url: string, body?: unknown) {
    return this.makeRequest<T>('PUT', url, body);
  }
  protected delete<T>(url: string) {
    return this.makeRequest<T>('DELETE', url);
  }
}
