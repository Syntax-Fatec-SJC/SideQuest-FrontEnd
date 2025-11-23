import {
  MdOutlineDashboard, MdChecklist, MdOutlineCalendarToday, MdOutlineAssessment,
  MdOutlinePeopleAlt, MdNotificationsNone, MdFolder, MdLogout, MdKeyboardArrowRight,
  MdKeyboardArrowLeft, MdDelete
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import type { IconType } from "react-icons";
import useAuth from '../hooks/useAuth';
import { BiSolidUser } from "react-icons/bi";

interface SidebarLinkProps {
  icon: IconType;
  label: string;
  to?: string;
  onClick?: () => void;
  active?: boolean;
  indented?: boolean;
}

const SidebarLink = ({ icon: Icon, label, to = "#", onClick, active, indented }: SidebarLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-2 p-2 rounded ${indented ? 'pl-6' : ''
      } ${active ? 'text-blue-400 bg-blue-50' : 'hover:bg-gray-200'
      }`}
  >
    <Icon size={20} />
    {label}
  </Link>
);

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(() => localStorage.getItem('projetoSelecionadoId'));
  const [expandido, setExpandido] = useState(false);


  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'projetoSelecionadoId') {
        setProjetoSelecionadoId(localStorage.getItem('projetoSelecionadoId'));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/acesso');
  };

  return (
    <>
      {/* Sidebar lateral desktop */}
      <div className={`hidden sm:flex w-52 bg-white shadow-lg my-8 flex-col p-4 rounded-r-3xl border-r-2 border-gray-200 ${className}`}>
        <div className="flex flex-col items-center mt-10 mb-4">
          <div className="bg-gray-300 rounded-full w-20 h-20 flex items-center justify-center">
            <span className="text-black text-5xl"><BiSolidUser /></span>
          </div>
          <h1 className="font-bold text-xl mt-2 truncate max-w-160px" title={usuario?.nome || 'Usuário'}>
            {usuario?.nome || 'Usuário'}
          </h1>
          <p className="text-sm text-gray-500 truncate max-w-160px" title={usuario?.email || ''}>
            {usuario?.email || 'Sem email'}
          </p>
        </div>

        <div className="flex flex-col gap-2 px-4 flex-1">
          <SidebarLink icon={MdOutlineDashboard} label="Dashboard" to="/dashboard" />
          <SidebarLink icon={MdOutlineCalendarToday} label="Calendário" to="/calendario" />
          <SidebarLink icon={MdNotificationsNone} label="Avisos" to="/avisos" />

          <SidebarLink icon={MdFolder} label="Projetos" to="/projetos" />

          {projetoSelecionadoId && (
            <>
              <SidebarLink icon={MdChecklist} label="Tarefas" to="/tarefas" indented={true} />
              <SidebarLink icon={MdOutlinePeopleAlt} label="Membros" to="/membros" indented={true} />
              <SidebarLink icon={MdOutlineAssessment} label="Relatórios" to="/relatorio" indented={true} />
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 px-4 mb-3.5 mt-6">
          <SidebarLink icon={MdLogout} label="Sair" onClick={handleLogout} to="/acesso" />
        </div>
      </div>

      {/* Menu inferior mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg sm:hidden z-40">
        <div className="flex justify-around items-center h-16 px-2">
          <Link to="/dashboard" className="flex flex-col items-center text-xs">
            <MdOutlineDashboard size={24} />
            Dashboard
          </Link>
          <Link to="/calendario" className="flex flex-col items-center text-xs">
            <MdOutlineCalendarToday size={24} />
            Calendário
          </Link>
          <Link to="/avisos" className="flex flex-col items-center text-xs">
            <MdNotificationsNone size={24} />
            Avisos
          </Link>
          <Link to="/projetos" className="flex flex-col items-center text-xs">
            <MdFolder size={24} />
            Projetos
          </Link>
          <button onClick={() => setExpandido(!expandido)} className="flex flex-col items-center text-xs">
            {expandido ? <MdKeyboardArrowLeft size={24} /> : <MdKeyboardArrowRight size={24} />}
            Mais
          </button>
        </div>

        {expandido && (
          <div className="flex justify-around items-center h-16 border-t border-gray-200 px-2">
            {projetoSelecionadoId && (
              <>
                <Link to="/tarefas" className="flex flex-col items-center text-xs">
                  <MdChecklist size={24} />
                  Tarefas
                </Link>
                <Link to="/membros" className="flex flex-col items-center text-xs">
                  <MdOutlinePeopleAlt size={24} />
                  Membros
                </Link>
                <Link to="/relatorio" className="flex flex-col items-center text-xs">
                  <MdOutlineAssessment size={24} />
                  Relatórios
                </Link>
              </>
            )}
            <Link to="/acesso" onClick={handleLogout} className="flex flex-col items-center text-xs">
              <MdLogout size={24} />
              Sair
            </Link>
          </div>
        )}
      </div>

    </>
  );
}