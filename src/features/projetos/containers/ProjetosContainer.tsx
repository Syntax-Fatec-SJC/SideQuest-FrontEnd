import { useProjetos } from "../hooks/useProjetos";
import { ProjetosView } from "../components/ProjetosView";
import useAuth from '../../../shared/hooks/useAuth';
import { projetoService } from '../../../services/ProjetoService';

/**
 * Container responsável pela lógica de negócio da feature de projetos.
 * Usa hooks personalizados e repassa dados para componentes de UI.
 */
export function ProjetosContainer() {
  const projetosState = useProjetos();
  const { usuario } = useAuth();

  const handleCreate = async (data: { nome: string; prazo: string; descricao?: string; usuarios?: string[] }) => {
    if (!usuario?.id) return;
    await projetoService.criarProjeto(
      { nome: data.nome, prazo: data.prazo, descricao: data.descricao },
      usuario.id
    );
  };

  return <ProjetosView {...({ ...projetosState, handleCreate } as any)} />;
}