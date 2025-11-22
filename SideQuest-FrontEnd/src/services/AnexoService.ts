// AnexoService.ts - COM TIMEOUT E LOGS PARA DEBUG

const API_BASE_URL = "http://localhost:8080/api/anexos";

export interface AnexoInfo {
    id: string;
    nome: string;
    tipo: string;
    tamanho: string;
    dataUpload?: string;
}

export interface AnexoUploadResponse {
    sucesso: boolean;
    total: number;
    enviados: number;
    arquivos: AnexoInfo[];
    erros?: string[];
}

export interface AnexoListResponse {
    tarefaId: string;
    totalArquivos: number;
    tamanhoTotal: string;
    arquivos: AnexoInfo[];
}

class AnexoService {

    private getToken(): string {
        return localStorage.getItem("token") || "";
    }

    /**
     * Fetch com timeout para não travar
     */
    private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout: A requisição demorou muito');
            }
            throw error;
        }
    }

    /**
     * Upload de arquivos
     */
    async uploadAnexos(tarefaId: string, files: File[]): Promise<AnexoUploadResponse> {
        console.log("===========================================");
        console.log("[AnexoService] UPLOAD");
        console.log("TarefaId:", tarefaId);
        console.log("Arquivos:", files.length);
        console.log("===========================================");

        if (files.length === 0) {
            console.log("[AnexoService] Nenhum arquivo para enviar");
            return { sucesso: true, total: 0, enviados: 0, arquivos: [] };
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
            console.log("  ->", file.name, `(${(file.size / 1024).toFixed(1)} KB)`);
        });

        try {
            console.log("[AnexoService] Enviando para:", `${API_BASE_URL}/${tarefaId}`);

            const response = await this.fetchWithTimeout(
                `${API_BASE_URL}/${tarefaId}`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.getToken()}`,
                    },
                    body: formData,
                },
                30000 // 30 segundos para upload
            );

            console.log("[AnexoService] Status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("[AnexoService] Erro:", errorData);
                throw new Error(errorData.erro || errorData.mensagem || `Erro ${response.status}`);
            }

            const data = await response.json();
            console.log("[AnexoService] Resposta:", data);

            return {
                sucesso: data.sucesso,
                total: data.total,
                enviados: data.enviados,
                arquivos: (data.arquivos || []).map((a: any) => ({
                    id: a.id,
                    nome: a.nome,
                    tipo: a.tipo,
                    tamanho: a.tamanho,
                    dataUpload: a.dataUpload,
                })),
                erros: data.erros,
            };

        } catch (error: any) {
            console.error("[AnexoService] ERRO no upload:", error.message);
            throw error;
        }
    }

    /**
     * Listar anexos de uma tarefa
     */
    async listarAnexos(tarefaId: string): Promise<AnexoListResponse> {
        console.log("===========================================");
        console.log("[AnexoService] LISTAR ANEXOS");
        console.log("TarefaId:", tarefaId);
        console.log("URL:", `${API_BASE_URL}/${tarefaId}`);
        console.log("===========================================");

        try {
            const response = await this.fetchWithTimeout(
                `${API_BASE_URL}/${tarefaId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${this.getToken()}`,
                        "Content-Type": "application/json",
                    },
                },
                10000 // 10 segundos timeout
            );

            console.log("[AnexoService] Status:", response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log("[AnexoService] 404 - Nenhum anexo");
                    return {
                        tarefaId,
                        totalArquivos: 0,
                        tamanhoTotal: "0 B",
                        arquivos: [],
                    };
                }
                const errorData = await response.json().catch(() => ({}));
                console.error("[AnexoService] Erro:", errorData);
                throw new Error(errorData.erro || `Erro ${response.status}`);
            }

            const data = await response.json();
            console.log("[AnexoService] Resposta:", data);
            console.log("[AnexoService] Total:", data.totalArquivos);

            const arquivos: AnexoInfo[] = (data.arquivos || []).map((a: any) => {
                const anexo = {
                    id: a.id || "",
                    nome: a.nome || "",
                    tipo: a.tipo || "image",
                    tamanho: a.tamanho || "0 B",
                    dataUpload: a.dataUpload,
                };
                console.log("  ->", anexo.nome, "ID:", anexo.id);
                return anexo;
            });

            console.log("[AnexoService] SUCESSO -", arquivos.length, "anexos");

            return {
                tarefaId: data.tarefaId,
                totalArquivos: data.totalArquivos,
                tamanhoTotal: data.tamanhoTotal,
                arquivos,
            };

        } catch (error: any) {
            console.error("[AnexoService] ERRO ao listar:", error.message);
            // Retorna vazio em caso de erro para não travar
            return {
                tarefaId,
                totalArquivos: 0,
                tamanhoTotal: "0 B",
                arquivos: [],
            };
        }
    }

    /**
     * Excluir anexo
     */
    async excluirAnexo(anexoId: string): Promise<void> {
        console.log("[AnexoService] Excluindo:", anexoId);

        try {
            const response = await this.fetchWithTimeout(
                `${API_BASE_URL}/arquivo/${anexoId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${this.getToken()}`,
                    },
                },
                10000
            );

            if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
            }

            console.log("[AnexoService] Excluido");

        } catch (error: any) {
            console.error("[AnexoService] Erro ao excluir:", error.message);
            throw error;
        }
    }

    /**
     * Download
     */
    async downloadAnexo(anexoId: string, fileName: string): Promise<void> {
        console.log("[AnexoService] Download:", fileName);

        const response = await fetch(`${API_BASE_URL}/download/${anexoId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.getToken()}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    /**
     * URL para visualizar
     */
    getUrlArquivo(anexoId: string): string {
        return `${API_BASE_URL}/arquivo/${anexoId}`;
    }
}

export const anexoService = new AnexoService();