// src/services/tarefaService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080'; // URL do seu backend Spring Boot

interface TarefaData {
    name: string;
    description: string;
    responsible: string[];
    endDate: string;
    status: "Pendente" | "Desenvolvimento" | "Concluído";
    comment: string;
    files: File[];
}

export const tarefaService = {
    // Criar nova tarefa COM arquivos
    async criarTarefa(data: TarefaData, projetoId: string) {
        const formData = new FormData();

        // Monta o objeto tarefa (SEM os arquivos)
        const tarefaJson = {
            nome: data.name,
            descricao: data.description,
            usuarioIds: data.responsible,
            prazoFinal: data.endDate,
            status: data.status,
            comentario: data.comment,
            projetoId: projetoId
        };

        // Adiciona o JSON da tarefa como Blob
        formData.append('tarefa', new Blob([JSON.stringify(tarefaJson)], {
            type: 'application/json'
        }));

        // Adiciona os arquivos
        if (data.files && data.files.length > 0) {
            data.files.forEach((file) => {
                formData.append('files', file);
            });
        }

        const response = await axios.post(`${API_URL}/cadastrar/tarefas`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    },

    // Atualizar tarefa existente COM arquivos
    async atualizarTarefa(tarefaId: string, data: TarefaData) {
        const formData = new FormData();

        const tarefaJson = {
            nome: data.name,
            descricao: data.description,
            usuarioIds: data.responsible,
            prazoFinal: data.endDate,
            status: data.status,
            comentario: data.comment
        };

        formData.append('tarefa', new Blob([JSON.stringify(tarefaJson)], {
            type: 'application/json'
        }));

        // Adiciona novos arquivos se houver
        if (data.files && data.files.length > 0) {
            data.files.forEach((file) => {
                formData.append('files', file);
            });
        }

        const response = await axios.put(`${API_URL}/atualizar/tarefas/${tarefaId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    },

    // Listar anexos de uma tarefa
    async listarAnexos(tarefaId: string) {
        const response = await axios.get(`${API_URL}/api/anexos/tarefa/${tarefaId}`);
        return response.data;
    },

    // Deletar um anexo específico
    async deletarAnexo(anexoId: string) {
        await axios.delete(`${API_URL}/api/anexos/${anexoId}`);
    },

    // Excluir tarefa
    async excluirTarefa(tarefaId: string) {
        await axios.delete(`${API_URL}/excluir/tarefas/${tarefaId}`);
    }
};