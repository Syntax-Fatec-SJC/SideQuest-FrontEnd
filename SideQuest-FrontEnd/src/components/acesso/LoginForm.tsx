import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import BotaoGoogle from '../BotaoGoogle';
import './LoginForm.css';
import type { LoginDTO } from '../../types/api';
import ApiService from '../../services/ApiService';

interface LoginFormProps {}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem('');

    try {
      const dadosParaLogin: LoginDTO = {
        email: loginData.email,
        senha: loginData.password
      }

      const resposta = await ApiService.realizarLogin(dadosParaLogin);
      setMensagem(resposta.mensagem);
      console.log('Login realizado:', resposta);

      const usuarioSessao = {
        id: resposta.id,
        nome: resposta.nome,
        email: resposta.email
      };

      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioSessao));
      localStorage.setItem('usuario', JSON.stringify(usuarioSessao));
      localStorage.setItem('usuarioId', usuarioSessao.id);

      setTimeout(() => {
        navigate('/projetos');
      }, 1000);
    } catch (error) {
      console.error('Erro no login', error);
      setMensagem('Email ou senha incorretos.');
    } finally {
      setIsLoading(false);
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

        {/* <div className="social-icons flex my-4 w-full">
          <BotaoGoogle texto="Entrar com conta Google" />
        </div> */}
        {mensagem && (
          <div className={`w-full p-2 rounded mb-3 text-center text-sm transition-colors duration-200 ${
            mensagem.includes('sucesso')
              ? ' text-[#1565C0] '
              : ' text-red-700'
          }`}>
            {mensagem}
          </div>
        )}

        {/* <span className="text-[#1565C0] text-xs mb-2">ou use sua conta</span> */}

        <input
          type="email"
          name="email"
          value={loginData.email}
          onChange={handleChange}
          placeholder="Email"
          className="bg-[#E3F2FD] text-[#1565C0] rounded-lg px-4 py-2 mb-2 w-full border border-[#1565C0] min-w-[180px] sm:min-w-[220px]"
          required
        />

        <input
          type="password"
          name="password"
          value={loginData.password}
          onChange={handleChange}
          placeholder="Senha"
          className="bg-[#E3F2FD] text-[#1565C0] rounded-lg px-4 py-2 mb-2 w-full border border-[#1565C0] min-w-[180px] sm:min-w-[220px]"
          required
        />

        {/* <a
          href="#"
          className="text-[#FFD600] text-xs mb-2 hover:underline"
        >
          Esqueceu a senha?
        </a> */}

        <button
          type="submit"
          disabled={isLoading}
          className="font-bold px-8 py-2 rounded-lg mt-2 border-none"
          style={{
            background: 'linear-gradient(135deg, #ffaf00, #ffe0b2)',
            color: '#0a192f',
            boxShadow: '0 0 30px rgba(255,175,0,0.3)',
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
