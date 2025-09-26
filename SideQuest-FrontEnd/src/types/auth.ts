// Tipos para autenticação
export interface LoginData {
  email: string;
  senha: string;
}

export interface CadastroData {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  id: string;
  nome: string;
}

export interface CadastroResponse {
  mensagem: string;
  email: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  fotoPerfil?: string;
  provedor: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface ErrorResponse {
  message?: string;
  erro?: string;
  [key: string]: string | undefined;
}