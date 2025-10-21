import { DashboardView } from "../components/DashboardView";
import type { PizzaItem, EntregaItem, AtualizacaoItem } from "../../../types/Dashboard";

export function DashboardContainer() {
  const dadosPizza: PizzaItem[] = [
    { chave: "Pendentes", valor: 5 },
    { chave: "Em Desenvolvimento", valor: 8 },
    { chave: "Concluidas", valor: 12 },
  ];

  const entregas: EntregaItem[] = [
    {
      titulo: "Entrega do relatório",
      descricao: "Finalizar relatório mensal",
      responsavel: "João",
      data: "22/10/2025",
    },
    {
      titulo: "Deploy da funcionalidade",
      descricao: "Liberar nova feature no dashboard",
      responsavel: "Maria",
      data: "24/10/2025",
    },
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
    }
  ];

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
    />
  );
}
