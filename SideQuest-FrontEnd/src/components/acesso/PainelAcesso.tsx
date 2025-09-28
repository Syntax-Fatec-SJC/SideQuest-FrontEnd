import React from 'react';

interface AuthToggleProps {
  onToggleToLogin: () => void;
  onToggleToSignup: () => void;
}

const PainelAcesso: React.FC<AuthToggleProps> = ({ onToggleToLogin, onToggleToSignup }) => {
  return (
    <div className="toggle-container w-full sm:w-4/5 md:w-1/2">
      <div className="toggle" style={{ background: 'linear-gradient(135deg, #ff8c1a, #ffaf00)' }}>
        <div className="toggle-panel toggle-left">
          <h1 className="text-[#1565C0]">Bem-vindo de volta!</h1>
          <p className="text-[#1565C0]">Para se manter conectado, faça login com suas informações pessoais</p>
          <button 
            className="font-bold px-8 py-2 rounded-lg mt-2 border-none" 
            style={{ background: 'linear-gradient(135deg, #ffaf00, #ffe0b2)', color: '#0a192f', boxShadow: '0 0 30px rgba(255,175,0,0.3)' }} 
            onClick={onToggleToLogin}
          >
            Entrar
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1 className="text-[#1565C0]">Olá, Amigo!</h1>
          <p className="text-[#1565C0]">Insira seus dados pessoais e comece sua jornada conosco</p>
          <button 
            className="font-bold px-8 py-2 rounded-lg mt-2 border-none" 
            style={{ background: 'linear-gradient(135deg, #ffaf00, #ffe0b2)', color: '#0a192f', boxShadow: '0 0 30px rgba(255,175,0,0.3)' }} 
            onClick={onToggleToSignup}
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PainelAcesso;