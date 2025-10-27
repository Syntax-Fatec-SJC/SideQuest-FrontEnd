// src/services/UsuarioService.ts - CRIAR ESTE ARQUIVO

import { ApiBase } from './ApiBase';

export interface UsuarioSimples {
    id: string;
    nome: string;
    email: string;
}

class UsuarioService extends ApiBase {
    // Listar todos os usuarios do sistema
    async listarTodos(): Promise<UsuarioSimples[]> {
        return this.get<UsuarioSimples[]>('/api/usuarios');
    }

    // Buscar usuario por ID
    async buscarPorId(id: string): Promise<UsuarioSimples> {
        return this.get<UsuarioSimples>(`/api/usuarios/${id}`);
    }
}

export const usuarioService = new UsuarioService();