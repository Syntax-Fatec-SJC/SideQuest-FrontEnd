import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cadastro from './Cadastro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cadastro" element={<Cadastro />} />
        {/* Outras rotas aqui */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;