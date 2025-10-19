// Projeto
export type StatusProjeto = 'ATIVO' | 'EM_ANDAMENTO' | 'ATRASADO' | 'CONCLUIDO' | 'CONCLUIDO_COM_ATRASO';

export type Projeto = {
  id: string;
  nome: string;
  status: StatusProjeto;
  usuarioIds: string[];
  prazo: string;
  descricao?: string;
}

