import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BotaoGoogle from "../BotaoGoogle";
import { HiEye, HiEyeOff } from "react-icons/hi";


interface CadastroProps {
  onSubmit?: (cadastroData: { nome: string; email: string; senha: string }) => void;
}

function CadastroForm({ onSubmit }: CadastroProps) {
  const [showSenha, setShowSenha] = useState(false);
  const [cadastroData, setCadastroData] = useState({
    nome: "",
    email: "",
    senha: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCadastroData({ ...cadastroData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(cadastroData);
    } else {
      console.log("Cadastro data:", cadastroData);
    }
    navigate("/projetos");
  };

  return (
    <div className="form-container sign-up w-full flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center w-full max-w-[400px] shadow-lg"
      >
        <h1 className="text-[#1565C0] text-2xl font-bold mb-4">Cadastrar</h1>

          <BotaoGoogle texto="Criar com Google" />

        <div className="flex items-center my-4 w-full">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <div className="w-full space-y-4">
          <input
            name="nome"
            type="text"
            value={cadastroData.nome}
            onChange={handleChange}
            placeholder="Nome"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf00] text-sm text-gray-700"
          />

          <input
            name="email"
            type="email"
            value={cadastroData.email}
            onChange={handleChange}
            placeholder="E-mail"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf00] text-sm text-gray-700"
          />

          <div className="relative w-full">
            <input
              name="senha"
              type={showSenha ? "text" : "password"}
              value={cadastroData.senha}
              onChange={handleChange}
              placeholder="Senha"
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf00] text-sm text-gray-700"
            />
            <button
              type="button"
              onClick={() => setShowSenha(!showSenha)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              {showSenha ? <HiEye size={18} />  : <HiEyeOff size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-main"
        >
          Criar Conta
        </button>
      </form>
    </div>
  );
}

export default CadastroForm;
