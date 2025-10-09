import type { MembroProjeto as MembroProjetoMembro  } from "../membros/type";

export type MembroProjeto = MembroProjetoMembro;

// Tarefa
export type Status = "Pendente" | "Desenvolvimento" | "Concluído";

export type Tarefa = {
  id?: string;
  nome: string;
  descricao?: string;
  status: Status;
  comentario?: string;
  prazoFinal?: string | null;
  projetoId: string;
  usuarioIds?: string[];
}
