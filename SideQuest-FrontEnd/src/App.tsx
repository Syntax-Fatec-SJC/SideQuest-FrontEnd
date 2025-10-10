import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Projetos from './features/projetos/Projetos';
// import Layout from './Layout';
import Membros from './features/membros/Membros';
import Acesso from './features/auth/Acesso';
import Tarefas from './features/tarefas/Tarefas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Acesso />} />
        <Route path="/membros" element={<Membros />} />
        <Route path="/projetos" element={<Projetos/>} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route path="/acesso" element={<Acesso/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;