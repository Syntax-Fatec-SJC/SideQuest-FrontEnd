import { ApiBase } from './ApiBase';
import type { MembroProjeto } from '../types/Membro';

class MembroService extends ApiBase {
  async listarMembrosProjeto(projetoId: string): Promise<MembroProjeto[]> {
    return this.get<MembroProjeto[]>(`/listar/${projetoId}/membros`);
  }

  async adicionarMembroProjeto(projetoId: string, usuarioId: string): Promise<void> {
    await this.post(`/adicionar/${projetoId}/membros/${usuarioId}`);
  }

  async removerMembroProjeto(projetoId: string, usuarioId: string): Promise<void> {
    await this.delete(`/excluir/${projetoId}/membros/${usuarioId}`);
  }
}

export const membrosService = new MembroService();
// compatibilidade com importações antigas que usavam o nome singular
export const membroService = membrosService;
