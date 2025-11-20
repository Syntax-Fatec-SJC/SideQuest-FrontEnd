// Tipo base do Aviso
export type Aviso = {
  id: string;
  tipo: 'urgente' | 'edicao' | 'novo' | 'atribuicao' | 'exclusao';
  mensagem: string;
  data: string;
  visualizado: boolean;
  usuarioId: string;
  tarefaId?: string;
  projetoId?: string;
  autorId?: string;
  autorNome?: string;
  membroAdicionadoId?: string;
  membroAdicionadoNome?: string;
}

// DTO para criar novo aviso
export type CriarAvisoDTO = {
  tipo: 'urgente' | 'edicao' | 'novo' | 'atribuicao' | 'exclusao';
  mensagem: string;
  data: string;
  usuarioId: string;
  tarefaId?: string;
  projetoId?: string;
  autorId?: string;
  autorNome?: string;
  membroAdicionadoId?: string;
  membroAdicionadoNome?: string;
}
