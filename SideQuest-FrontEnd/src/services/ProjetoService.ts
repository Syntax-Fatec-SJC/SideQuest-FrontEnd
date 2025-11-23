// src/services/ProjetoService.ts
import { ApiBase } from './ApiBase';
import type { Projeto, StatusProjeto } from '../types/Projeto';

class ProjetoService extends ApiBase {
  async listarProjetosDoUsuario(): Promise<Projeto[]> {
    return this.get<Projeto[]>('/listar/projetos/meus');
  }

  async criarProjeto(
    data: { nome: string; prazo: string; descricao?: string },
    usuarioIdCriador: string
  ) {
    const prazoISO = data.prazo
      ? new Date(`${data.prazo}T00:00:00`).toISOString()
      : undefined;

    const payload = {
      nome: data.nome,
      status: 'ATIVO' as StatusProjeto,
      ...(data.descricao ? { descricao: data.descricao } : {}),
      ...(prazoISO ? { prazoFinal: prazoISO } : {})
    };

    // usuarioIdCriador vai como query param; body vai no corpo em JSON
    return this.post(
      `/cadastrar/projetos?usuarioIdCriador=${encodeURIComponent(usuarioIdCriador)}`,
      payload
    );
  }

  async atualizarProjeto(id: string, dados: Partial<Pick<Projeto, 'nome' | 'status' | 'usuarioIds'>>): Promise<Projeto> {
    return this.put<Projeto>(`/atualizar/projetos/${id}`, { id, ...dados });
  }

  async excluirProjeto(id: string): Promise<void> {
    await this.delete<void>(`/excluir/projetos/${id}`);
  }
}

export const projetoService = new ProjetoService();
