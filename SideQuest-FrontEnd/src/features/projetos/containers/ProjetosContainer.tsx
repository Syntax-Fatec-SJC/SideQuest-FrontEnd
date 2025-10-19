import { useProjetos } from "../hooks/useProjetos";
import { ProjetosView } from "../components/ProjetosView";

/**
 * Container responsável pela lógica de negócio da feature de projetos.
 * Usa hooks personalizados e repassa dados para componentes de UI.
 */
export function ProjetosContainer() {
  const projetosState = useProjetos();

  return <ProjetosView {...projetosState} />;
}