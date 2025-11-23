import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardView } from "../components/DashboardView";
import { ConexaoPage } from "../../../shared/components/ConexaoPage";
import type { PizzaItem, EntregaItem, AtualizacaoItem } from "../../../types/Dashboard";
import { useProximasEntregas } from "../hooks/useProximasEntregas";
import { projetoService } from "../../../services/ProjetoService";
import { membrosService } from "../../../services/MembrosService";
import { tarefaService } from "../../../services/TarefaService";
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
  const { entregas: entregasBackend, error, carregarDados } = useProximasEntregas();
  const [membrosTodosProjetos, setMembrosTodosProjetos] = useState<Membro[]>([]);
  const [dadosPizza, setDadosPizza] = useState<PizzaItem[]>([
    { chave: "Pendentes", valor: 0 },
    { chave: "Em Desenvolvimento", valor: 0 },
    { chave: "Concluidas", valor: 0 },
  ]);
  const [loadingGrafico, setLoadingGrafico] = useState(true);

  useEffect(() => {
    async function carregarMembrosETarefas() {
      try {
        setLoadingGrafico(true);
        const usuarioId = localStorage.getItem("usuarioId"); 
        const projetos = await projetoService.listarProjetosDoUsuario();

        const promessasMembros = projetos.map(p =>
          membrosService.listarMembrosProjeto(p.id.toString())
        );
        const listasDeMembros = await Promise.all(promessasMembros);
        const membrosFlat = listasDeMembros.flat();
        const membrosUnicos = Array.from(new Map(membrosFlat.map(m => [m.usuarioId, m])).values());
        setMembrosTodosProjetos(membrosUnicos);

        const promessasTarefas = projetos.map(p =>
          tarefaService.listarTarefasDoProjeto(p.id.toString())
        );
        const listasDeTarefas = await Promise.all(promessasTarefas);
        const todasTarefas = listasDeTarefas.flat();

        const tarefasDoUsuario = usuarioId
          ? todasTarefas.filter(t => (t.usuarioIds || []).includes(usuarioId))
          : [];

        let pendentes = 0;
        let desenvolvimento = 0;
        let concluidas = 0;

        for (const t of tarefasDoUsuario) {
          switch (t.status) {
            case "Pendente":
              pendentes++;
              break;
            case "Desenvolvimento":
              desenvolvimento++;
              break;
            case "Concluído":
              concluidas++;
              break;
          }
        }

        setDadosPizza([
          { chave: "Pendentes", valor: pendentes },
            { chave: "Em Desenvolvimento", valor: desenvolvimento },
          { chave: "Concluidas", valor: concluidas },
        ]);
      } catch (e) {
        console.error("Erro ao carregar dados do gráfico", e);
        setDadosPizza([
          { chave: "Pendentes", valor: 0 },
          { chave: "Em Desenvolvimento", valor: 0 },
          { chave: "Concluidas", valor: 0 },
        ]);
      } finally {
        setLoadingGrafico(false);
      }
    }
    void carregarMembrosETarefas();
  }, []);

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
      loading={loadingGrafico}
      erro={null}
      entregas={entregas}
      atualizacoes={atualizacoes}
      dadosPizza={dadosPizza}
      onTarefaClick={handleTarefaClick}
    />
  );
}
