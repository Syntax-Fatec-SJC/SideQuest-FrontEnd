import { useState } from "react";
import BotaoGoogle from "../BotaoGoogle";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { authService, ApiError } from '../../services/authService';
import type { CadastroData } from '../../types/auth';

interface CadastroProps {
  onSubmit?: (cadastroData: CadastroData) => void;
}

function CadastroForm({ onSubmit }: CadastroProps) {
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
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      console.log('Iniciando cadastro para email:', cadastroData.email);
      
      // Se há uma função onSubmit personalizada, usa ela
      if (onSubmit) {
        onSubmit(cadastroData);
        return;
      }

      // Faz cadastro via API
      console.log('Fazendo requisição de cadastro...');
      const response = await authService.cadastro(cadastroData);
      console.log('Cadastro realizado com sucesso:', response.mensagem);
      
      // Mostra mensagem de sucesso e limpa o formulário
      alert(response.mensagem);
      setCadastroData({ nome: "", email: "", senha: "" });
      setLoading(false);
      
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setLoading(false); // Só para o loading se houver erro
      
      if (err instanceof ApiError) {
        // Se o erro contém campos específicos (validação)
        if (err.data && typeof err.data === 'object') {
          const errors: Record<string, string> = {};
          Object.keys(err.data).forEach(key => {
            if (key !== 'message' && key !== 'erro' && err.data && err.data[key]) {
              errors[key] = err.data[key] as string;
            }
          });
          
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          } else {
            setError(err.message);
          }
        } else {
          setError(err.message);
        }
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    }
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

        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

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
          disabled={loading}
          className={`btn-main mt-6 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Criando...' : 'Criar Conta'}
        </button>
      </form>
    </div>
  );
}

export default CadastroForm;
