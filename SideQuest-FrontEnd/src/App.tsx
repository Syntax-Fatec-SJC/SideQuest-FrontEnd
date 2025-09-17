import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cadastro from './Cadastro';
import Projetos from './Projetos';
import Layout from './Layout';
import Membros from './Membros';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/membros" element={<Membros />} />
        <Route path="/projetos" element={<Projetos/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;