import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardView } from "../components/DashboardView";
import { ConexaoPage } from "../../../shared/components/ConexaoPage";
import type { PizzaItem, EntregaItem, AtualizacaoItem } from "../../../types/Dashboard";
import { useProximasEntregas } from "../hooks/useProximasEntregas";
import { projetoService } from "../../../services/ProjetoService";
import { membrosService } from "../../../services/MembrosService";
import type { Tarefa } from "../../../types/Tarefa";

type ProjetoContextReturn = {
  setProjetoSelecionadoId: (id: string) => void;
};

const useProjeto = (): ProjetoContextReturn => {
  const setProjetoSelecionadoId = (id: string) => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("projetoSelecionadoId", id);
      }
    } catch {
      // erro ignorado
    }
  };
  return { setProjetoSelecionadoId };
};

type Membro = {
  usuarioId: string;
  nome: string;
};

export function DashboardContainer() {
  const navigate = useNavigate();
  const { setProjetoSelecionadoId } = useProjeto();
  const { entregas: entregasBackend, loading, error, carregarDados } = useProximasEntregas();
  const [membrosTodosProjetos, setMembrosTodosProjetos] = useState<Membro[]>([]);

  useEffect(() => {
    async function carregarTodosOsMembros() {
      try {
        const projetos = await projetoService.listarProjetosDoUsuario();
        const promessasMembros = projetos.map(p => membrosService.listarMembrosProjeto(p.id.toString()));
        const listasDeMembros = await Promise.all(promessasMembros);
        const membrosFlat = listasDeMembros.flat();
        const membrosUnicos = Array.from(new Map(membrosFlat.map(m => [m.usuarioId, m])).values());
        setMembrosTodosProjetos(membrosUnicos);
      } catch (e) {
        console.error('Erro ao carregar membros para o dashboard', e);
        setMembrosTodosProjetos([]);
      }
    }
    void carregarTodosOsMembros();
  }, []);

  const dadosPizza: PizzaItem[] = [
    { chave: "Pendentes", valor: 5 },
    { chave: "Em Desenvolvimento", valor: 8 },
    { chave: "Concluidas", valor: 12 },
  ];

  const formatarData = (dataISO: string | Date | undefined): string => {
    if (!dataISO) return "Sem data";
    const data = new Date(dataISO);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const entregas: (EntregaItem & { projetoId: string })[] = entregasBackend.map((tarefa: Tarefa) => {
    const ids = tarefa.usuarioIds || [];
    let responsavelLabel = "Sem responsável";

    if (ids.length > 0 && membrosTodosProjetos.length > 0) {
      const nomes = ids
        .map(id => membrosTodosProjetos.find(m => m.usuarioId === id)?.nome || null)
        .filter(Boolean) as string[];

      if (nomes.length > 0) {
        responsavelLabel = nomes.length <= 2
          ? nomes.join(', ')
          : `${nomes.slice(0, 2).join(', ')} (+${nomes.length - 2})`;
      }
    }

    return {
      projetoId: tarefa.projetoId,
      titulo: tarefa.nome,
      descricao: tarefa.descricao || "Sem descrição",
      responsavel: responsavelLabel,
      data: formatarData(tarefa.prazoFinal || undefined),
    };
  });

  const handleTarefaClick = (projetoId: string) => {
    setProjetoSelecionadoId(projetoId);
    navigate('/tarefas');
  };

  if (error) {
    return (
      <ConexaoPage
        erroMensagem={error.message}
        onTentarNovamente={carregarDados}
      />
    );
  }

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
      loading={loading}
      erro={null} 
      entregas={entregas}
      atualizacoes={atualizacoes}
      dadosPizza={dadosPizza}
      onTarefaClick={handleTarefaClick}
    />
  );
}
