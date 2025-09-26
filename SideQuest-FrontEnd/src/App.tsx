import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Projetos from './pages/Projetos';
import Layout from './Layout';
import Membros from './Membros';
import Acesso from './pages/Acesso';
import Tarefas from './Tarefas';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal - Página de Acesso (Login/Cadastro) */}
        <Route path="/" element={<Acesso />} />
        
        {/* Rota de callback para OAuth2 */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Rota para redefinir senha */}
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rotas protegidas com Layout */}
        <Route path="/app" element={<Layout />}>
          <Route path="projetos" element={<Projetos />} />
          <Route path="membros" element={<Membros />} />
          <Route path="tarefas" element={<Tarefas />} />
        </Route>
        
        {/* Rotas de compatibilidade (redirecionam para /app/*) */}
        <Route path="/projetos" element={<Layout />}>
          <Route index element={<Projetos />} />
        </Route>
        <Route path="/membros" element={<Layout />}>
          <Route index element={<Membros />} />
        </Route>
        <Route path="/tarefas" element={<Layout />}>
          <Route index element={<Tarefas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;