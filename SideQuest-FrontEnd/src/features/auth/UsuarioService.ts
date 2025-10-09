import { ApiBase } from '../../shared/services/ApiBase';
import type { Login, LoginResponse, Usuario, UsuarioCompleto, UsuarioResumo } from '../auth/type';

class UsuarioService extends ApiBase {
  async cadastrarUsuario(dadosUsuario: Usuario): Promise<UsuarioCompleto> {
    return this.post<UsuarioCompleto>('/cadastrar/usuarios', dadosUsuario);
  }

  async realizarLogin(dadosLogin: Login): Promise<LoginResponse> {
    return this.post<LoginResponse>('/login', dadosLogin);
  }

  async listarUsuarios(): Promise<UsuarioResumo[]> {
    return this.get<UsuarioResumo[]>('/usuarios');
  }
}

export const usuarioService = new UsuarioService();
