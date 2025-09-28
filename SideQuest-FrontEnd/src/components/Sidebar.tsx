import { 
  MdOutlineDashboard, MdChecklist, MdOutlineCalendarToday, MdOutlineAssessment, MdOutlinePeopleAlt, MdNotificationsNone, MdFolder, MdLogout 
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import useAuth from '../hooks/useAuth';

interface SidebarLinkProps {
  icon: IconType;
  label: string;
  to?: string;         
  onClick?: () => void;    
}

const SidebarLink = ({ icon: Icon, label, to = "#", onClick }: SidebarLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded"
  >
    <Icon size={20} />
    {label}
  </Link>
);

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
      navigate('/acesso');
    }
  };

  return (
    <div className="w-52 h-[calc(100vh-4rem)] bg-white shadow-lg mt-8 mb-8 flex flex-col p-4 rounded-r-3xl border-r-2 border-gray-200">
      
      <div className="flex flex-col items-center mt-10 mb-4">
        <div className="bg-gray-300 rounded-full w-20 h-20 flex items-center justify-center">
          <span className="text-white text-2xl">R</span>
        </div>
        <h1 className="font-bold text-xl mt-2 truncate max-w-[160px]" title={usuario?.nome || 'Usuário'}>
          {usuario?.nome || 'Usuário'}
        </h1>
        <p className="text-sm text-gray-500 truncate max-w-[160px]" title={usuario?.email || ''}>
          {usuario?.email || 'Sem email'}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-4">
        <SidebarLink icon={MdOutlineDashboard} label="Dashboard" to="/dashboard" />
        <SidebarLink icon={MdChecklist} label="Tarefas" to="/tarefas" />
        <SidebarLink icon={MdOutlineCalendarToday} label="Calendário" to="/calendario" />
        <SidebarLink icon={MdOutlineAssessment} label="Relatórios" to="/relatorios" />
        <SidebarLink icon={MdOutlinePeopleAlt} label="Membros" to="/membros" />
        <SidebarLink icon={MdNotificationsNone} label="Avisos" to="/avisos" />
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-2 px-4 mb-4">
        <SidebarLink icon={MdFolder} label="Projetos" to="/projetos" />
        <SidebarLink icon={MdLogout} label="Sair" onClick={handleLogout} to="/acesso" />
      </div>
    </div>
  );
}
