import { TarefasContainer } from "./containers/TarefasContainer";
import { ProtecaoPage } from "../../shared/components/ProtecaoPage";

export default function Tarefas() {
  return (
    <ProtecaoPage>
      <TarefasContainer />
    </ProtecaoPage>
  );
}