import { ApiBase } from './ApiBase';
import type { Tarefa } from '../types/Tarefa';

class DashboardService extends ApiBase {
  async listarProximasEntregas(): Promise<Tarefa[]> {
    return this.get<Tarefa[]>('/listar/tarefas/proximas-entregas');
  }
}

export const dashboardService = new DashboardService();
