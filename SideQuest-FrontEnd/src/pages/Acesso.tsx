import { useState } from 'react';
import LoginForm from '../components/acesso/LoginForm';
import PainelAcesso from '../components/acesso/PainelAcesso';
import CadastroForm from '../components/acesso/CadastroForm';
import ForgotPasswordModal from '../components/acesso/ForgotPasswordModal';

const Acesso: React.FC = () => {
  const [active, setActive] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const toggleToLogin = () => setActive(false);
  const toggleToSignup = () => setActive(true);

  return (
    <div className="login-page">
      <div className={`container ${active ? 'active' : ''} bg-[#0a192f] rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.35)] relative overflow-hidden min-h-[680px] text-white mx-auto flex items-center justify-center w-[98vw] max-w-[900px] min-w-[320px] sm:w-[85vw] sm:max-w-[1000px] lg:w-[70vw] lg:max-w-[1200px]`}>
        
        <CadastroForm />
        <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
        <PainelAcesso onToggleToLogin={toggleToLogin} onToggleToSignup={toggleToSignup} />
      </div>
      
      {/* Modal renderizado fora do container para sobrepor corretamente */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default Acesso;