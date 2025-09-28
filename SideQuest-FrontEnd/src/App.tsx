import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Projetos from './pages/Projetos';
// import Layout from './Layout';
import Membros from './Membros';
import Acesso from './pages/Acesso';
import Tarefas from './Tarefas';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';

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