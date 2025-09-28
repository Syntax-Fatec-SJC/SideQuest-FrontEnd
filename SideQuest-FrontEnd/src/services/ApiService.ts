import type { LoginDTO, LoginResponseDTO, Projeto, UsuarioCompleto, UsuarioDTO, MembroProjeto, UsuarioResumo } from "../types/api";

const BASE_URL = 'http://localhost:8080';

class ApiService {
    private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
        try {
            const response = await fetch(`${BASE_URL}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok){
                const errorData = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${errorData}`)
            }
            if (response.status === 204) return null;
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    async cadastrarUsuario(dadosUsuario: UsuarioDTO): Promise<UsuarioCompleto>{
        return await this.makeRequest('/cadastrar/usuarios', {
            method: 'POST',
            body: JSON.stringify(dadosUsuario)
        });
    }

    async realizarLogin(dadosLogin: LoginDTO): Promise<LoginResponseDTO>{
        return await this.makeRequest('/login', {
            method: 'POST',
            body: JSON.stringify(dadosLogin)
        })
    }

    async listarProjetosDoUsuario(usuarioId: string): Promise<Projeto[]>{
        return this.makeRequest(`/listar/${usuarioId}/projetos`);
    }

    async criarProjeto(usuarioIdCriador: string, nome: string): Promise<Projeto>{
        return this.makeRequest(`/cadastrar/projetos?usuarioIdCriador=${usuarioIdCriador}`, {
            method: 'POST',
            body: JSON.stringify({
                nome,
                status: 'ATIVO'
            })
        })
    }

    async excluirProjeto(id: string): Promise<void>{
        const response = await fetch(`http://localhost:8080/excluir/projetos/${id}`,{
            method: 'DELETE'
        });
        if (!response.ok){
            const tx = await response.text();
            throw new Error(`Erro HTTP ${response.status}: ${tx}`);
        }
    }

    async atualizarProjeto(id: string, dados: Partial<Pick<Projeto,'nome'|'status'|'usuarioIds'>>): Promise<Projeto> {
    return this.makeRequest(`/atualizar/projetos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
        id,
        ...dados
        })
    });
    }

    async listarMembrosProjeto(projetoId: string): Promise<MembroProjeto[]> {
        return this.makeRequest(`/listar/${projetoId}/membros`);
    }

    async adicionarMembroProjeto(projetoId: string, usuarioId: string): Promise<void> {
        await this.makeRequest(`/adicionar/${projetoId}/membros/${usuarioId}`, { method: 'POST' });
    }

    async removerMembroProjeto(projetoId: string, usuarioId: string): Promise<void> {
        await this.makeRequest(`/excluir/${projetoId}/membros/${usuarioId}`, { method: 'DELETE' });
    }

    async listarUsuarios(): Promise<UsuarioResumo[]> {
        return this.makeRequest('/usuarios');
    }

    async listarTarefasDoProjeto(projetoId: string){
        return this.makeRequest(`/listar/${projetoId}/tarefas`);
    }

    async criarTarefa(dados: { nome: string; descricao?: string; status: string; comentario?: string; prazoFinal?: string | null; projetoId: string; usuarioIds?: string[]; }) {
        return this.makeRequest('/cadastrar/tarefas', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    }

    async atualizarTarefa(id: string, dados: { nome: string; descricao?: string; status: string; comentario?: string; prazoFinal?: string | null; projetoId: string; usuarioIds?: string[]; }) {
        return this.makeRequest(`/atualizar/tarefas/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ id, ...dados })
        });
    }

    async excluirTarefa(id: string){
        return this.makeRequest(`/excluir/tarefas/${id}`, { method: 'DELETE' });
    }
}

export default new ApiService();