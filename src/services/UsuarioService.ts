// src/services/UsuarioService.ts
export interface UsuarioResumo {
    id: string;
    nome: string;
    email: string;
}

class UsuarioService {
    private usuariosDB: UsuarioResumo[] = [
        { id: "u1", nome: "Carlos Silva", email: "carlos@dev.com" },
        { id: "u2", nome: "Beatriz Souza", email: "beatriz@dev.com" },
        { id: "u3", nome: "Mário Fernandes", email: "mario@dev.com" },
    ];

    async listarUsuarios(): Promise<UsuarioResumo[]> {
        return new Promise(resolve => setTimeout(() => resolve(this.usuariosDB), 300));
    }
}

export const usuarioService = new UsuarioService(); // export nomeado
