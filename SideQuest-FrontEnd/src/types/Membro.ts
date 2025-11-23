import type {  UsuarioResumo as ProjetoUsuarioResumo } from './Auth';

export type UsuarioResumo = ProjetoUsuarioResumo;

export type MembroProjeto = {
  usuarioId: string;
  nome: string;
  email: string;
  criador: boolean;
}

export type LinhaEdicao = {
    nome: string;
    email: string;
    usuarioIdSelecionado?: string;
    erro?: string;
}