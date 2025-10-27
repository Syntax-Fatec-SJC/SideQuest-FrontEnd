const API_BASE_URL = 'http://localhost:8080';

class ApiService {
    private async makeRequest(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro HTTP:', response.status, errorText);
                throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            }

            return response.text();
        } catch (error) {
            console.error('ERRO NA REQUISIÇÃO:', error);
            throw error;
        }
    }

    // ==================== TAREFAS ====================
    async listarTarefas() {
        return this.makeRequest('/listar/tarefas');
    }

    // ✅ CORRIGIDO: Rota certa do backend
    async listarTarefasDoProjeto(projetoId: string) {
        return this.makeRequest(`/projetos/${projetoId}/tarefas`);
    }

    async criarTarefa(dados: any) {
        return this.makeRequest('/cadastrar/tarefas', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    async buscarTarefa(id: string) {
        return this.makeRequest(`/buscar/tarefas/${id}`);
    }

    async atualizarTarefa(id: string, dados: any) {
        return this.makeRequest(`/atualizar/tarefas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados),
        });
    }

    async excluirTarefa(id: string) {
        return this.makeRequest(`/excluir/tarefas/${id}`, {
            method: 'DELETE',
        });
    }

    // ==================== MEMBROS ====================
    // ✅ CORRIGIDO: Rota certa do backend
    async listarMembrosProjeto(projetoId: string) {
        return this.makeRequest(`/listar/${projetoId}/membros`);
    }

    async adicionarMembroProjeto(projetoId: string, usuarioId: string) {
        return this.makeRequest(`/adicionar/${projetoId}/membros/${usuarioId}`, {
            method: 'POST',
        });
    }

    async removerMembroProjeto(projetoId: string, usuarioId: string) {
        return this.makeRequest(`/excluir/${projetoId}/membros/${usuarioId}`, {
            method: 'DELETE',
        });
    }

    // ==================== PROJETOS ====================
    async listarProjetos() {
        return this.makeRequest('/listar/projetos');
    }

    async criarProjeto(dados: { nome: string; descricao: string }) {
        return this.makeRequest('/cadastrar/projetos', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    async buscarProjeto(id: string) {
        return this.makeRequest(`/buscar/projeto/${id}`);
    }

    async atualizarProjeto(id: string, dados: { nome: string; descricao: string }) {
        return this.makeRequest(`/atualizar/projetos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados),
        });
    }

    async excluirProjeto(id: string) {
        return this.makeRequest(`/excluir/projetos/${id}`, {
            method: 'DELETE',
        });
    }

    // ==================== USUÁRIOS ====================
    async listarUsuarios() {
        return this.makeRequest('/usuarios');
    }

    async buscarUsuario(id: string) {
        return this.makeRequest(`/buscar/usuario/${id}`);
    }

    async cadastrarUsuario(dados: { nome: string; email: string; senha: string }) {
        return this.makeRequest('/cadastrar/usuarios', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    async atualizarUsuario(id: string, dados: { nome: string; email: string }) {
        return this.makeRequest(`/atualizar/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados),
        });
    }

    async excluirUsuario(id: string) {
        return this.makeRequest(`/excluir/usuario/${id}`, {
            method: 'DELETE',
        });
    }

    // ==================== AUTENTICAÇÃO ====================
    async login(email: string, senha: string) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        if (!response.ok) {
            throw new Error('Credenciais inválidas');
        }

        const data = await response.json();

        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        return data;
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioLogado');
    }
}

export default new ApiService();