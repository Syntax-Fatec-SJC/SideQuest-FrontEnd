import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import BotaoGoogle from "../BotaoGoogle";
import { HiEye, HiEyeOff } from "react-icons/hi";
import type { UsuarioDTO } from "../../types/api";
import ApiService from "../../services/ApiService";


function CadastroForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const [showSenha, setShowSenha] = useState(false);
  const [cadastroData, setCadastroData] = useState<CadastroData>({
    nome: "",
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCadastroData({ ...cadastroData, [e.target.name]: e.target.value });
    // Limpa os erros quando o usuário começa a digitar
    if (error) setError('');
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem('');

    try {
      const dadosParaCadastro: UsuarioDTO = {
        nome: cadastroData.nome,
        email: cadastroData.email,
        senha: cadastroData.senha
      };

      const usuarioCriado = await ApiService.cadastrarUsuario(dadosParaCadastro);
      setMensagem('Usuário cadastrado com sucesso!');
      console.log('Usuário criado:', usuarioCriado)

      setTimeout(() => {
        navigate('/projetos');
      }, 2000);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setMensagem('Erro ao cadastrar usuário. Tente novamente.');
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="form-container sign-up w-full flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center w-full max-w-[400px] shadow-lg"
      >
        <h1 className="text-[#1565C0] text-2xl font-bold mb-4">Cadastrar</h1>

          {/* <BotaoGoogle texto="Criar com Google" /> */}

        <div className="flex items-center my-4 w-full">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {mensagem && (
          <div className={`w-full p-2 rounded mb-3 text-center text-sm transition-colors duration-200 ${
            mensagem.includes('sucesso')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {mensagem}
          </div>
        )}

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

        <div className="w-full space-y-4">
          <div>
            <input
              name="nome"
              type="text"
              value={cadastroData.nome}
              onChange={handleChange}
              placeholder="Nome"
              required
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf00] text-sm text-gray-700 ${
                fieldErrors.nome ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {fieldErrors.nome && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.nome}</p>
            )}
          </div>

          <div>
            <input
              name="email"
              type="email"
              value={cadastroData.email}
              onChange={handleChange}
              placeholder="E-mail"
              required
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf00] text-sm text-gray-700 ${
                fieldErrors.email ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="relative w-full">
              <input
                name="senha"
                type={showSenha ? "text" : "password"}
                value={cadastroData.senha}
                onChange={handleChange}
                placeholder="Senha"
                required
                disabled={loading}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffaf00] text-sm text-gray-700 ${
                  fieldErrors.senha ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                {showSenha ? <HiEye size={18} />  : <HiEyeOff size={18} />}
              </button>
            </div>
            {fieldErrors.senha && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.senha}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-main"
        >
          {isLoading ? 'Cadastrando...' : 'Criar Conta'}
        </button>
      </form>
    </div>
  );
}

export default CadastroForm;
