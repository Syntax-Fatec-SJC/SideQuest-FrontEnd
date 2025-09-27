import type { LoginDTO, LoginResponseDTO, UsuarioCompleto, UsuarioDTO } from "../types/api";

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
            return await response.json();
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
}

export default new ApiService();