import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BotaoGoogle from '../BotaoGoogle';
import './LoginForm.css';

interface LoginFormProps {
  onSubmit?: (loginData: { email: string; password: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(loginData);
    } else {
      console.log('Login data:', loginData);
    }
    navigate('/projetos');
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

        <a
          href="#"
          className="text-[#FFD600] text-xs mb-2 hover:underline"
        >
          Esqueceu a senha?
        </a>

        <button
          type="submit"
          className="font-bold px-8 py-2 rounded-lg mt-2 border-none"
          style={{
            background: 'linear-gradient(135deg, #ffaf00, #ffe0b2)',
            color: '#0a192f',
            boxShadow: '0 0 30px rgba(255,175,0,0.3)',
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
