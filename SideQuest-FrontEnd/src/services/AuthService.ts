import { ApiBase } from './ApiBase';
import type { Login, LoginResponse, Usuario, UsuarioCompleto, UsuarioResumo } from '../types/Auth';

class UsuarioService extends ApiBase {
  async cadastrarUsuario(dadosUsuario: Usuario): Promise<UsuarioCompleto> {
    return this.post<UsuarioCompleto>('/usuario/cadastrar', dadosUsuario);
  }

  async realizarLogin(dadosLogin: Login): Promise<LoginResponse> {
    return this.post<LoginResponse>('/usuario/login', dadosLogin);
  }

  async realizarLogout(): Promise<void> {
    return this.post<void>('/logout');
  }

  async listarUsuarios(): Promise<UsuarioResumo[]> {
    return this.get<UsuarioResumo[]>('/listar/usuarios');
  }

  async buscarUsuario(id: string): Promise<UsuarioCompleto> {
    return this.get<UsuarioCompleto>(`/usuarios/${id}`);
  }

  async atualizarUsuario(id: string, dados: Partial<Usuario>): Promise<UsuarioCompleto> {
    return this.put<UsuarioCompleto>(`/usuarios/${id}`, dados);
  }

  async deletarUsuario(id: string): Promise<void> {
    return this.delete<void>(`/usuarios/${id}`);
  }
}

export const usuarioService = new UsuarioService();
