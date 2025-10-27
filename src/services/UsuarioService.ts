// UsuarioService.ts
// Diretório: src/services/UsuarioService.ts

// 1. EXPORTAÇÃO DO TIPO ESPERADO PELO COMPONENTE Tarefas.tsx
export interface UsuarioSimples {
    id: string;
    nome: string;
    email: string;
}

// Simulação de um banco de dados de usuários
class UsuarioService {

    private usuariosDB: UsuarioSimples[] = [
        { id: "u1", nome: "Carlos Silva", email: "carlos@dev.com" },
        { id: "u2", nome: "Beatriz Souza", email: "beatriz@dev.com" },
        { id: "u3", nome: "Mário Fernandes", email: "mario@dev.com" },
    ];

    /**
     * Implementa a listagem de todos os usuários (necessário no Tarefas.tsx).
     * ⚠️ Substitua pela sua chamada API real.
     */
    async listarTodos(): Promise<UsuarioSimples[]> {
        console.log('[UsuarioService] Carregando todos os usuários...');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.usuariosDB);
            }, 300);
        });
    }

    // Se precisar de outros métodos, adicione-os aqui
}

// 2. EXPORTAÇÃO DA INSTÂNCIA DO SERVIÇO ESPERADA PELO COMPONENTE Tarefas.tsx
export const usuarioService = new UsuarioService();