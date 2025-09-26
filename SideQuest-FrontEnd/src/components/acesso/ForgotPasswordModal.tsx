import React, { useState } from 'react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/solicitar-reset-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Se o email existir, um link de reset será enviado.');
        setEmail('');
        setTimeout(() => {
          onClose();
          setMessage('');
        }, 3000);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Erro ao enviar email de reset');
      }
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      style={{ 
        zIndex: 999999, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div 
        className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[400px] shadow-lg mx-4 flex flex-col items-center"
        style={{ boxShadow: '0 20px 40px -10px rgba(10,25,47,0.8)' }}
      >
        <div className="flex justify-between items-center mb-2 w-full">
          <h1 className="text-[#1565C0] text-2xl font-bold">
            Esqueceu a senha?
          </h1>
          <button
            onClick={handleClose}
            className="text-[#FFD600] hover:text-[#ffaf00] text-lg font-bold transition-all w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <span className="text-[#1565C0] text-xs mb-4 block text-center">
          Não se preocupe! Digite seu email abaixo e enviaremos um link seguro para você redefinir sua senha.
        </span>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="bg-[#E3F2FD] text-[#1565C0] rounded-lg px-4 py-2 mb-2 w-full border border-[#1565C0] min-w-[180px] sm:min-w-[220px]"
          />

          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="w-full mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="text-[#FFD600] text-xs mb-2 hover:underline"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`font-bold rounded-lg mt-2 border-none text-xs uppercase font-semibold letter-spacing-wide ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, #ffaf00, #ffe0b2)',
              color: '#0a192f',
              boxShadow: '0 0 30px rgba(255,175,0,0.3)',
              padding: '10px 45px',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.5px',
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
