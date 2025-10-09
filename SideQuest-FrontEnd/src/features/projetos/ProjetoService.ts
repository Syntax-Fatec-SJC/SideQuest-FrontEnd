// src/services/ProjetoService.ts
import { ApiBase } from '../../shared/services/ApiBase';
import type { Projeto } from '../projetos/type';

class ProjetoService extends ApiBase {
  async listarProjetosDoUsuario(usuarioId: string): Promise<Projeto[]> {
    return this.get<Projeto[]>(`/listar/${usuarioId}/projetos`);
  }

  async criarProjeto(usuarioIdCriador: string, nome: string): Promise<Projeto> {
    return this.post<Projeto>(`/cadastrar/projetos?usuarioIdCriador=${usuarioIdCriador}`, { nome, status: 'ATIVO' });
  }

  async atualizarProjeto(id: string, dados: Partial<Pick<Projeto, 'nome' | 'status' | 'usuarioIds'>>): Promise<Projeto> {
    return this.put<Projeto>(`/atualizar/projetos/${id}`, { id, ...dados });
  }

  async excluirProjeto(id: string): Promise<void> {
    await this.delete<void>(`/excluir/projetos/${id}`);
  }
}

export const projetoService = new ProjetoService();
