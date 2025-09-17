import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cadastro from './Cadastro';
import Projetos from './Projetos';
import Layout from './Layout';
import Modal from './components/Modal';
import Membros from './Membros';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/modal" element={<Modal />} />
        <Route path="/membros" element={<Membros />} />
        <Route path="/projetos" element={<Projetos/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;