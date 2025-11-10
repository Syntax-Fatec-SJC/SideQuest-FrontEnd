import { DashboardContainer } from "./containers/DashboardContainer";
import { ProtecaoPage } from "../../shared/components/ProtecaoPage";

export default function Dashboard() {
  return (
    <ProtecaoPage>
      <DashboardContainer />
    </ProtecaoPage>
  );
}