import type { Tarefa } from "../../../types/Tarefa";

export const tarefasUtils = {

  calcularPorcentagemConcluidas: (tarefas: Tarefa[]): number => {
    const totalTarefas = tarefas.length;
    if (totalTarefas === 0) return 0;
    
    const tarefasConcluidas = tarefas.filter(tarefa => tarefa.status === "Concluído").length;
    return Math.round((tarefasConcluidas / totalTarefas) * 100);
  },

  temTarefas: (tarefas: Tarefa[]): boolean => {
    return tarefas.length > 0;
  },

  contarPorStatus: (tarefas: Tarefa[]) => {
    return {
      pendente: tarefas.filter(t => t.status === "Pendente").length,
      desenvolvimento: tarefas.filter(t => t.status === "Desenvolvimento").length,
      concluido: tarefas.filter(t => t.status === "Concluído").length,
      total: tarefas.length
    };
  }
} as const;