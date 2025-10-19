// src/services/ProjetoService.ts
import { ApiBase } from './ApiBase';
import type { Projeto, StatusProjeto } from '../types/Projeto';

class ProjetoService extends ApiBase {
  async listarProjetosDoUsuario(usuarioId: string): Promise<Projeto[]> {
    return this.get<Projeto[]>(`/listar/${usuarioId}/projetos`);
  }

  async criarProjeto(usuarioIdCriador: string, dados: { nome: string; prazo?: string; descricao?: string }): Promise<Projeto> {
    return this.post<Projeto>(`/cadastrar/projetos?usuarioIdCriador=${usuarioIdCriador}`, { 
      nome: dados.nome, 
      status: 'ATIVO' as StatusProjeto,
      ...(dados.prazo && { prazo: dados.prazo }),
      ...(dados.descricao && { descricao: dados.descricao })
    });
  }

  async atualizarProjeto(id: string, dados: Partial<Pick<Projeto, 'nome' | 'status' | 'usuarioIds'>>): Promise<Projeto> {
    return this.put<Projeto>(`/atualizar/projetos/${id}`, { id, ...dados });
  }

  async excluirProjeto(id: string): Promise<void> {
    await this.delete<void>(`/excluir/projetos/${id}`);
  }
}

export const projetoService = new ProjetoService();
