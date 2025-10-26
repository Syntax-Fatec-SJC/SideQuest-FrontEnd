import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardView } from "../components/DashboardView";
import type { PizzaItem, EntregaItem, AtualizacaoItem } from "../../../types/Dashboard";
import { useProximasEntregas } from "../hooks/useProximasEntregas";
import useAuth from "../../../shared/hooks/useAuth";
import type { Tarefa } from "../../../types/Tarefa";
import { projetoService } from "../../../services/ProjetoService";
import { membrosService } from "../../../services/MembrosService";

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
    }
  };
  return { setProjetoSelecionadoId };
};

type Membro = {
  usuarioId: string;
  nome: string;
};

export function DashboardContainer() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { setProjetoSelecionadoId } = useProjeto();
  const { entregas: entregasBackend, loading: loadingEntregas, erro: erroEntregas } = useProximasEntregas(usuario?.id || null);
  const [membrosTodosProjetos, setMembrosTodosProjetos] = useState<Membro[]>([]);

  useEffect(() => {
    async function carregarTodosOsMembros() {
      if (!usuario?.id) return;

      try {
        const projetos = await projetoService.listarProjetosDoUsuario(usuario.id);
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
  }, [usuario?.id]);

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
        if (nomes.length <= 2) {
          responsavelLabel = nomes.join(', ');
        } else {
          const nomesVisiveis = nomes.slice(0, 2).join(', ');
          const nomesOcultos = nomes.length - 2;
          responsavelLabel = `${nomesVisiveis} (+${nomesOcultos})`;
        }
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
    localStorage.setItem('projetoSelecionadoId', projetoId);
    navigate('/tarefas'); 
  };

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

  const DashboardViewAny = DashboardView as any;

  return (
    <DashboardViewAny
      loading={loadingEntregas}
      erro={erroEntregas}
      entregas={entregas}
      atualizacoes={atualizacoes}
      dadosPizza={dadosPizza}
      onTarefaClick={handleTarefaClick}
    />
  );
}
