import { ApiBase } from './ApiBase';
import type { Aviso, CriarAvisoDTO } from '../types/Aviso';

/**
 * Serviço para gerenciar avisos
 */
class AvisoService extends ApiBase {
  /**
   * Lista todos os avisos de um usuário
   */
  async listarPorUsuario(usuarioId: string, apenasNaoVisualizados: boolean = false): Promise<Aviso[]> {
    const params = apenasNaoVisualizados ? '?apenasNaoVisualizados=true' : '';
    return this.get<Aviso[]>(`/avisos/usuario/${usuarioId}${params}`);
  }

  /**
   * Cadastra um novo aviso
   */
  async cadastrar(dto: CriarAvisoDTO): Promise<Aviso> {
    return this.post<Aviso>('/cadastrar/avisos', dto);
  }

  /**
   * Marca um aviso como visualizado
   */
  async marcarComoVisualizado(avisoId: string): Promise<Aviso> {
    return this.patch<Aviso>(`/avisos/${avisoId}/visualizado`);
  }

  /**
   * Deleta um aviso
   */
  async deletar(avisoId: string): Promise<{ mensagem: string }> {
    return this.delete<{ mensagem: string }>(`/avisos/${avisoId}`);
  }
}

export default new AvisoService();
