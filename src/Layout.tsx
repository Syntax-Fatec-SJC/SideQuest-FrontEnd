// Layout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./shared/components/Sidebar";

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar /> 
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Outlet /> 
      </div>
    </div>
  );
}
