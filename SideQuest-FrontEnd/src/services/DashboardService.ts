import { ApiBase } from './ApiBase';
import type { Tarefa } from '../types/Tarefa';

class DashboardService extends ApiBase {
  async listarProximasEntregas(usuarioId: string): Promise<Tarefa[]> {
    return this.get<Tarefa[]>(`/usuarios/${usuarioId}/proximas-entregas`);
  }
}

export const dashboardService = new DashboardService();
