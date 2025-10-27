import { ApiBase } from './ApiBase';

export interface AnexoBackend {
    id: string;
    tarefaId: string;
    nomeOriginal: string;
    contentType: string;
    tamanho: number;
    dataUpload: string;
    urlDownload: string;
}

class AnexoService extends ApiBase {
    // Listar anexos de uma tarefa
    async listarPorTarefa(tarefaId: string): Promise<AnexoBackend[]> {
        return this.get<AnexoBackend[]>(`/api/anexos/tarefa/${tarefaId}`);
    }

    // Upload de anexos (multiplos arquivos)
    async upload(tarefaId: string, files: File[]): Promise<AnexoBackend[]> {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        return this.uploadFormData<AnexoBackend[]>(`/api/anexos/tarefa/${tarefaId}`, formData);
    }

    // Deletar anexo individual
    async deletar(anexoId: string): Promise<void> {
        return this.delete<void>(`/api/anexos/${anexoId}`);
    }

    // Deletar todos anexos de uma tarefa
    async deletarPorTarefa(tarefaId: string): Promise<void> {
        return this.delete<void>(`/api/anexos/tarefa/${tarefaId}`);
    }
}

export const anexoService = new AnexoService();