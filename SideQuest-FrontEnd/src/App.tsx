import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Projetos from './pages/Projetos';
import Layout from './Layout';
import Membros from './Membros';
import Acesso from './pages/Acesso';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/membros" element={<Membros />} />
        <Route path="/projetos" element={<Projetos/>} />
        <Route path="/acesso" element={<Acesso/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;