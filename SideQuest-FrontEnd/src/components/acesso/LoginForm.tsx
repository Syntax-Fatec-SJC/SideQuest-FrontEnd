import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BotaoGoogle from '../BotaoGoogle';
import ForgotPasswordModal from './ForgotPasswordModal';
import { authService, ApiError } from '../../services/authService';
import { tokenUtils, userUtils } from '../../utils/auth';
import type { LoginData } from '../../types/auth';
import './LoginForm.css';

interface LoginFormProps {
  onSubmit?: (loginData: LoginData) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [loginData, setLoginData] = useState<LoginData>({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    // Limpa o erro quando o usuário começa a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Se há uma função onSubmit personalizada, usa ela
      if (onSubmit) {
        onSubmit(loginData);
        return;
      }

      // Faz login via API
      const response = await authService.login(loginData);
      
      // Salva token e dados do usuário
      tokenUtils.saveToken(response.token);
      userUtils.saveUser({ id: response.id, nome: response.nome });
      
      // Redireciona para projetos
      navigate('/projetos');
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container sign-in w-full flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center w-full max-w-[400px] shadow-lg"
        style={{ boxShadow: '0 20px 40px -10px rgba(10,25,47,0.8)' }}
      >
        <h1 className="text-[#1565C0] text-2xl font-bold mb-2">Entrar</h1>

        <div className="social-icons flex my-4 w-full">
          <BotaoGoogle texto="Entrar com conta Google" />
        </div>

        <span className="text-[#1565C0] text-xs mb-2">ou use sua conta</span>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          value={loginData.email}
          onChange={handleChange}
          placeholder="Email"
          className="bg-[#E3F2FD] text-[#1565C0] rounded-lg px-4 py-2 mb-2 w-full border border-[#1565C0] min-w-[180px] sm:min-w-[220px]"
          required
          disabled={loading}
        />

                <input
          id="senha"
          name="senha"
          type="password"
          placeholder="Senha"
          value={loginData.senha}
          onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />

        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-[#FFD600] text-xs mb-2 hover:underline"
        >
          Esqueceu a senha?
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`font-bold px-8 py-2 rounded-lg mt-2 border-none ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, #ffaf00, #ffe0b2)',
            color: '#0a192f',
            boxShadow: '0 0 30px rgba(255,175,0,0.3)',
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default LoginForm;
