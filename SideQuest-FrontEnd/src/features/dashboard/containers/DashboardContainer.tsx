import { DashboardView } from "../components/DashboardView";
import type { PizzaItem, EntregaItem, AtualizacaoItem } from "../../../types/Dashboard";
import { useProximasEntregas } from "../hooks/useProximasEntregas";
import useAuth from "../../../shared/hooks/useAuth";
import type { Tarefa } from "../../../types/Tarefa";

export function DashboardContainer() {
  const { usuario } = useAuth();
  const { entregas: entregasBackend, loading: loadingEntregas, erro: erroEntregas } = useProximasEntregas(usuario?.id || null);

  const dadosPizza: PizzaItem[] = [
    { chave: "Pendentes", valor: 5 },
    { chave: "Em Desenvolvimento", valor: 8 },
    { chave: "Concluidas", valor: 12 },
  ];

  // Converte tarefas do backend para o formato de EntregaItem
  const formatarData = (dataISO: string | Date | undefined): string => {
    if (!dataISO) return "Sem prazo";
    const data = new Date(dataISO);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const entregas: EntregaItem[] = entregasBackend.map((tarefa: Tarefa) => ({
    titulo: tarefa.nome,
    descricao: tarefa.descricao || "Sem descrição",
    responsavel: tarefa.usuarioIds && tarefa.usuarioIds.length > 0 
      ? (tarefa.usuarioIds.length > 1 ? tarefa.usuarioIds : tarefa.usuarioIds[0])
      : "Sem responsável",
    data: formatarData(tarefa.prazoFinal || undefined),
  }));

  const atualizacoes: AtualizacaoItem[] = [
    {
      titulo: "Bug corrigido",
      descricao: "Correção do bug de login",
      responsavel: ["Ana", "Carlos"],
      data: "20/10/2025",
    },
    {
      titulo: "Nova feature2",
      descricao: "Implementação da tela de relatórios",
      responsavel: "Ana",
      data: "21/10/2025",
    },
    {
      titulo: "Bug corrigido3",
      descricao: "Correção do bug de login",
      responsavel: "Ana",
      data: "20/10/2025",
    },
    {
      titulo: "Nova feature",
      descricao: "Implementação da tela de relatórios",
      responsavel: "Ana",
      data: "21/10/2025",
    }
  ];

  return (
    <DashboardView
      dadosPizza={dadosPizza}
      loadingPizza={false}
      entregas={entregas}
      atualizacoes={atualizacoes}
      erro={erroEntregas}
      loadingEntregas={loadingEntregas}
    />
  );
}
