import type {  UsuarioResumo as ProjetoUsuarioResumo } from './Auth';

export type UsuarioResumo = ProjetoUsuarioResumo;


// Membro do Projeto
export type MembroProjeto = {
  usuarioId: string;
  nome: string;
  email: string;
  criador: boolean;
}


// Tipos internos do componente
export type LinhaEdicao = {
    nome: string;
    email: string;
    usuarioIdSelecionado?: string;
    erro?: string;
}

export type Toast = {
    tipo: 'erro' | 'sucesso' | 'info';
    mensagem: string;
}
