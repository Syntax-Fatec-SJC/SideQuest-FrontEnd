import { ApiBase } from './ApiBase';
import type { MembroProjeto } from '../types/Membro';

class MembroService extends ApiBase {
  async listarMembrosProjeto(projetoId: string): Promise<MembroProjeto[]> {
    return this.get<MembroProjeto[]>(`/projetos/${projetoId}/membros`);
  }

  async adicionarMembroProjeto(projetoId: string, usuarioId: string): Promise<void> {
    await this.post(`/projetos/${projetoId}/membros`, { usuarioIds: [usuarioId] });
  }

  async removerMembroProjeto(projetoId: string, usuarioId: string): Promise<void> {
    await this.delete(`/projetos/${projetoId}/membros/${usuarioId}`);
  }
}

export const membrosService = new MembroService();
// compatibilidade com importações antigas que usavam o nome singular
export const membroService = membrosService;
