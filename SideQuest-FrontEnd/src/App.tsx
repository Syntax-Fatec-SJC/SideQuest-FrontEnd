import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cadastro from './Cadastro';
// import Projetos from './Projetos';
import Layout from './Layout';
import Modal from './components/Modal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/modal" element={<Modal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;