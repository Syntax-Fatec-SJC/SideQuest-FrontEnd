// Layout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar /> {/* Fixa a sidebar */}
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Outlet /> {/* Aqui o conteúdo das rotas vai aparecer */}
      </div>
    </div>
  );
}
