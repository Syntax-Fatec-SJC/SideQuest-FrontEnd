// TarefaService.ts

// 🚀 CORREÇÃO: A interface Tarefa DEVE ser exportada
export interface Tarefa {
  id: string;
  name: string;
  description: string;
  responsible: string[];
  endDate: string;
  status: "Pendente" | "Desenvolvimento" | "Concluído";
  comment: string;
}

// Simulação de um banco de dados em memória
let tarefasDB: Tarefa[] = [
  {
    id: "t1",
    name: "Configurar Ambiente Dev",
    description: "Instalar Node.js, TypeScript e dependências NPM/Yarn.",
    responsible: ["m1", "m2"],
    endDate: "2025-10-30",
    status: "Desenvolvimento",
    comment: "Revisar as variáveis de ambiente.",
  },
  {
    id: "t2",
    name: "Reunião de Escopo",
    description: "Alinhar expectativas com o cliente sobre o MVP.",
    responsible: ["m3"],
    endDate: "2025-10-28",
    status: "Pendente",
    comment: "Preparar apresentação.",
  },
];

class TarefaService {
  /**
   * 🚀 CORREÇÃO: saveOrUpdate (Esperado pelo componente)
   */
  async saveOrUpdate(data: Partial<Tarefa>): Promise<Tarefa> {
    return new Promise(resolve => {
      setTimeout(() => {
        if (data.id) {
          // Lógica de Atualização (PUT)
          tarefasDB = tarefasDB.map(t => t.id === data.id ? { ...t, ...data } as Tarefa : t);
          const updatedTask = tarefasDB.find(t => t.id === data.id)!;
          resolve(updatedTask);
        } else {
          // Lógica de Criação (POST)
          const newTask: Tarefa = {
            ...data,
            id: `t${Date.now()}`,
            status: data.status || "Pendente",
            responsible: data.responsible || [],
          } as Tarefa;
          tarefasDB.push(newTask);
          resolve(newTask);
        }
      }, 500);
    });
  }

  /**
   * 🚀 CORREÇÃO: loadAll (Esperado pelo componente)
   */
  async loadAll(): Promise<Tarefa[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(tarefasDB);
      }, 300);
    });
  }

  /**
   * 🚀 CORREÇÃO: delete (Tornado público para resolver o erro 2445)
   */
  async delete(tarefaId: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        tarefasDB = tarefasDB.filter(t => t.id !== tarefaId);
        resolve();
      }, 300);
    });
  }
}

export const tarefaService = new TarefaService();