export interface UsuarioDTO {
    nome: string;
    email: string;
    senha: string;
}

export interface LoginDTO {
    email: string;
    senha: string;
}

export interface LoginResponseDTO {
    id: string;
    nome: string;
    email: string;
    mensagem: string;
}

export interface UsuarioCompleto {
    id: string;
    nome: string;
    email: string;
    senha: string;
    projetosIds?: string[];
    tarefasIds?: string[];
}
export interface Projeto{
    id: string;
    nome: string;
    status: string;
    usuarioIds: string[];
}