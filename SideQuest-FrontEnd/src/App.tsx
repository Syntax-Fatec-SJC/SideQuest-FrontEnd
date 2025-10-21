import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Projetos from './features/projetos/Projetos';
// import Layout from './Layout';
import Membros from './features/membros/Membros';
import Acesso from './features/auth/Acesso';
import Tarefas from './features/tarefas/Tarefas';
import Dashboard from './features/dashboard/Dashboard';
import  Relatorio  from "./features/relatorios/Relatorio"; 
import { ToastProvider } from './shared/contexts/ToastContext';
import { ToastContainer } from './shared/components/ui/ToastContainer';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Acesso />} />
          <Route path="/membros" element={<Membros />} />
          <Route path="/projetos" element={<Projetos/>} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/acesso" element={<Acesso/>} />
          <Route path="/relatorio" element={<Relatorio />} />
          <Route path="/dashboard" element={<Dashboard />} />


        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;