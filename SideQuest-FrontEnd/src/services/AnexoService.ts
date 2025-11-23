// AnexoService.ts - Serviço de Anexos usando Axios
// ========================================
// IMPORTAÇÕES
// ========================================
import anexoApi from './anexoApi';

// ========================================
// INTERFACES
// ========================================
export interface AnexoInfo {
    id: string;
    nome: string;
    tipo: string;
    tamanho: string;
    contentType?: string;
    dataUpload?: string;
}

export interface AnexoUploadResponse {
    sucesso: boolean;
    total: number;
    enviados: number;
    arquivos: AnexoInfo[];
    erros?: string[];
}

export interface AnexoDownloadResponse {
    id: string;
    tarefaId: string;
    nome: string;
    tipo: string;
    contentType: string;
    tamanho: string;
    dataUpload: string;
    arquivoBase64: string;
}

// ========================================
// SERVIÇO
// ========================================
class AnexoService {
    private readonly baseURL = '/api/anexos';

    /**
     * UPLOAD: Envia arquivos para o backend → MongoDB
     */
    async uploadAnexos(tarefaId: string, files: File[]): Promise<AnexoUploadResponse> {
        console.log('===========================================');
        console.log('[AnexoService]  UPLOAD');
        console.log('TarefaId:', tarefaId);
        console.log('Arquivos:', files.length);
        console.log('===========================================');

        if (files.length === 0) {
            return { sucesso: true, total: 0, enviados: 0, arquivos: [] };
        }

        // Criar FormData
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
            console.log(`  → ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        });

        try {
            //  REQUISIÇÃO AXIOS → BACKEND (porta 8087)
            const response = await anexoApi.post<AnexoUploadResponse>(
                `${this.baseURL}/upload/${tarefaId}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 120000, // 2 minutos para arquivos grandes
                }
            );

            console.log('[AnexoService]  Upload concluído');
            console.log('[AnexoService]  Enviados:', response.data.enviados);
            return response.data;
        } catch (error: any) {
            console.error('[AnexoService]  Erro no upload:', error);

            if (error.response) {
                throw new Error(
                    error.response.data?.erro ||
                    error.response.data?.mensagem ||
                    `Erro ${error.response.status}`
                );
            } else if (error.request) {
                throw new Error('Sem resposta do servidor');
            } else {
                throw new Error(error.message || 'Erro desconhecido');
            }
        }
    }

    /**
     * LISTAR: Busca anexos do MongoDB
     */
    async listarAnexos(tarefaId: string): Promise<AnexoInfo[]> {
        console.log('===========================================');
        console.log('[AnexoService]  LISTAR');
        console.log('TarefaId:', tarefaId);
        console.log('===========================================');

        try {
            //  REQUISIÇÃO AXIOS → BACKEND (porta 8087)
            const response = await anexoApi.get<AnexoInfo[]>(`${this.baseURL}/${tarefaId}`);

            const arquivos = Array.isArray(response.data) ? response.data : [];
            console.log('[AnexoService]  Anexos carregados:', arquivos.length);

            arquivos.forEach((a, i) => {
                console.log(`  ${i + 1}. ${a.nome} (ID: ${a.id})`);
            });

            return arquivos;
        } catch (error: any) {
            console.error('[AnexoService]  Erro ao listar:', error);

            // Se 404 ou sem resposta → retornar array vazio (não travar a UI)
            if (error.response?.status === 404 || !error.response) {
                console.log('[AnexoService] ℹ Nenhum anexo encontrado');
                return [];
            }

            throw error;
        }
    }

    /**
     * EXCLUIR: Deleta anexo do MongoDB
     */
    async excluirAnexo(anexoId: string): Promise<void> {
        console.log('[AnexoService]  Excluindo:', anexoId);

        try {
            await anexoApi.delete(`${this.baseURL}/${anexoId}`);
            console.log('[AnexoService]  Anexo excluído');
        } catch (error: any) {
            console.error('[AnexoService]  Erro ao excluir:', error);

            if (error.response) {
                throw new Error(
                    error.response.data?.erro ||
                    error.response.data?.mensagem ||
                    `Erro ${error.response.status}`
                );
            }

            throw new Error('Erro ao excluir anexo');
        }
    }

    /**
     * EXCLUIR TODOS: Deleta todos os anexos de uma tarefa
     */
    async excluirAnexosPorTarefa(tarefaId: string): Promise<void> {
        console.log('[AnexoService]  Excluindo todos os anexos da tarefa:', tarefaId);

        try {
            await anexoApi.delete(`${this.baseURL}/tarefa/${tarefaId}`);
            console.log('[AnexoService]  Todos os anexos excluídos');
        } catch (error: any) {
            console.error('[AnexoService]  Erro:', error);
            throw error;
        }
    }

    /**
     * DOWNLOAD: Busca anexo com dados Base64
     */
    async downloadAnexo(anexoId: string): Promise<AnexoDownloadResponse> {
        console.log('[AnexoService]  Download:', anexoId);

        try {
            const response = await anexoApi.get<AnexoDownloadResponse>(`${this.baseURL}/download/${anexoId}`);
            console.log('[AnexoService]  Download concluído');
            return response.data;
        } catch (error: any) {
            console.error('[AnexoService]  Erro ao fazer download:', error);
            throw error;
        }
    }

    /**
     * BAIXAR ARQUIVO: Converte Base64 em arquivo e dispara download
     */
    async baixarArquivo(anexoId: string, nomeArquivo: string): Promise<void> {
        try {
            console.log('[AnexoService]  Baixando:', nomeArquivo);

            const anexo = await this.downloadAnexo(anexoId);

            // Converter Base64 → Blob
            const byteCharacters = atob(anexo.arquivoBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: anexo.contentType });

            // Criar link e disparar download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nomeArquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('[AnexoService]  Arquivo baixado');
        } catch (error) {
            console.error('[AnexoService]  Erro ao baixar:', error);
            throw error;
        }
    }

    /**
     * URL VISUALIZAÇÃO: Para usar em <img>, <embed>, etc
     */
    getUrlVisualizacao(anexoId: string): string {
        return `${anexoApi.defaults.baseURL}${this.baseURL}/download/${anexoId}`;
    }

    /**
     * HEALTH CHECK: Verifica se serviço está funcionando
     */
    async healthCheck(): Promise<{ status: string; service: string }> {
        try {
            const response = await anexoApi.get<{ status: string; service: string }>(`${this.baseURL}/health`);
            console.log('[AnexoService]  Health:', response.data);
            return response.data;
        } catch (error) {
            console.error('[AnexoService]  Health check falhou:', error);
            throw error;
        }
    }
}

// ========================================
// EXPORTAR INSTÂNCIA ÚNICA (Singleton)
// ========================================
export const anexoService = new AnexoService();
