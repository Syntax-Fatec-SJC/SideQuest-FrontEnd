import { ApiBase } from './ApiBase';
import type { Tarefa } from '../types/Tarefa';

class TarefaService extends ApiBase {
  async listarTarefasDoProjeto(projetoId: string): Promise<Tarefa[]> {
    return this.get<Tarefa[]>(`/projetos/${projetoId}/tarefas`);
  }

  async listarMinhasTarefas(): Promise<Tarefa[]> {
    return this.get<Tarefa[]>('/tarefas/minhas');
  }

  async listarProximasEntregas(): Promise<Tarefa[]> {
    return this.get<Tarefa[]>('/listar/tarefas/proximas-entregas');
  }

  async criarTarefa(dados: Tarefa): Promise<Tarefa> {
    return this.post<Tarefa>('/cadastrar/tarefas', dados);
  }

  async atualizarTarefa(id: string, dados: Tarefa): Promise<Tarefa> {
    return this.put<Tarefa>(`/atualizar/tarefas/${id}`, { id, ...dados });
  }

  async excluirTarefa(id: string): Promise<void> {
    await this.delete<void>(`/excluir/tarefas/${id}`);
  }

  async atualizarResponsaveis(id: string, usuarioIds: string[]): Promise<Tarefa> {
    return this.patch<Tarefa>(`/tarefas/${id}/responsaveis`, { usuarioIds });
  }
}

export const tarefaService = new TarefaService();
