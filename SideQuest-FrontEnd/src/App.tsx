import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Projetos from './features/projetos/Projetos';
import Membros from './features/membros/Membros';
import Acesso from './features/auth/Acesso';
import Tarefas from './features/tarefas/Tarefas';
import Dashboard from './features/dashboard/Dashboard';
import  Relatorio  from "./features/relatorios/Relatorio"; 
import Avisos from './features/avisos/Avisos';
import Calendario from './features/calendario/Calendario';
import Lixeira from './features/lixeira/Lixeira'
import { ToastProvider } from './shared/contexts/ToastContext';
import { ToastContainer } from './shared/components/ui/ToastContainer';

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case '/':
      case '/acesso':
        document.title = 'Login';
        break;
      case '/membros':
        document.title = 'Membros';
        break;
      case '/projetos':
        document.title = 'Projetos';
        break;
      case '/tarefas':
        document.title = 'Tarefas';
        break;
      case '/relatorio':
        document.title = 'Relatórios';
        break;
      case '/avisos':
        document.title = 'Avisos';
        break;
      case '/calendario':
        document.title = 'Calendário';
        break;
      case '/lixeira':
        document.title = 'Lixeira'
        break;
      default:
        document.title = 'SideQuest';
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <TitleUpdater />
        <Routes>
          <Route path="/" element={<Acesso />} />
          <Route path="/acesso" element={<Acesso />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/membros" element={<Membros />} />
          <Route path="/relatorio" element={<Relatorio />} />
          <Route path="/dashboard" element={<Dashboard />} />


          <Route path="/avisos" element={<Avisos />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/lixeira" element={<Lixeira />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
