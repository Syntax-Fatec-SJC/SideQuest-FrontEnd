import { useState } from "react";
import { useProjetosUsuario } from "../hooks/useProjetosUsuario";
import { useCalendarioEventos } from "../hooks/useCalendarioEventos";
import { CalendarioView } from "../components/CalendarioView";
import { ConexaoPage } from "../../../shared/components/ConexaoPage";

export function CalendarioContainer() {
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(null);
  const [apenasMinhasTarefas, setApenasMinhasTarefas] = useState(false);

  const {
    projetos,
    carregando: carregandoProjetos,
    erro: erroProjetos,
    carregarDados: carregarProjetos,
  } = useProjetosUsuario(true);

  const {
    eventos,
    carregando: carregandoEventos,
    erro: erroEventos,
    carregarDados: carregarEventos,
  } = useCalendarioEventos(projetoSelecionadoId, apenasMinhasTarefas);

  const erroServidor = erroProjetos || erroEventos;

  if (erroServidor) {
    return (
      <ConexaoPage
        erroMensagem={erroServidor.message || "Erro de conexão. Verifique o servidor."}
        onTentarNovamente={() => {
          carregarProjetos?.();
          carregarEventos?.();
        }}
      />
    );
  }

  return (
    <CalendarioView
      projetos={projetos}
      eventos={eventos}
      carregandoProjetos={carregandoProjetos}
      carregandoEventos={carregandoEventos}
      projetoSelecionadoId={projetoSelecionadoId}
      apenasMinhasTarefas={apenasMinhasTarefas}
      onChangeProjeto={setProjetoSelecionadoId}
      onToggleApenasMinhasTarefas={setApenasMinhasTarefas}
    />
  );
}
