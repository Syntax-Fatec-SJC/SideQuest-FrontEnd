// src/services/ApiBase.ts
import { ApiError } from "./../shared/errors/ApiError";

const DEFAULT_BASE = "http://localhost:8080";

export class ApiBase {
  protected baseUrl = import.meta.env.VITE_API_URL ?? DEFAULT_BASE;
  protected token?: string;

  private async getToken(): Promise<string | undefined> {
    if (this.token) return this.token;

    try {
      return localStorage.getItem("token") ?? undefined;
    } catch {
      return undefined; 
    }
  }

  protected async makeRequest<T>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    url: string,
    body?: unknown
  ): Promise<T> {
    const fullUrl = this.baseUrl + url;
    const tokenValue = await this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (tokenValue) headers["Authorization"] = `Bearer ${tokenValue}`;

    const resp = await fetch(fullUrl, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      
      // Tentar parsear JSON de erro
      let errorMessage = text || resp.statusText;
      let errorData: any = undefined;
      
      try {
        errorData = JSON.parse(text);
        // Verificar se há uma mensagem de erro do backend
        errorMessage = errorData.erro || errorData.message || errorData.details || text || resp.statusText;
      } catch (parseError) {
        // Se não for JSON válido, usar o texto direto
        errorMessage = text || resp.statusText;
      }
      
      throw new ApiError({ codigo: resp.status, message: errorMessage, detalhes: errorData });
    }

    // Sem corpo
    if (resp.status === 204 || resp.status === 205 || resp.headers.get("content-length") === "0") {
      return undefined as unknown as T;
    }

    const contentType = resp.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return undefined as unknown as T;
    }

    const text = await resp.text();
    return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
  }

  protected get<T>(url: string) {
    return this.makeRequest<T>("GET", url);
  }
  protected post<T>(url: string, body?: unknown) {
    return this.makeRequest<T>("POST", url, body);
  }
  protected put<T>(url: string, body?: unknown) {
    return this.makeRequest<T>("PUT", url, body);
  }
  protected patch<T>(url: string, body?: unknown) {
    return this.makeRequest<T>("PATCH", url, body);
  }
  protected delete<T>(url: string) {
    return this.makeRequest<T>("DELETE", url);
  }
}