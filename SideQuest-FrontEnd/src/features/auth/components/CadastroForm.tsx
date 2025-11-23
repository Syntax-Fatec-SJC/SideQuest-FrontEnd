import { useCadastro } from '../hooks/useCadastro';
import type { SignupHandler } from '../../../types/Auth';
import { HiEye, HiEyeOff } from 'react-icons/hi';

interface CadastroFormProps {
  onSignup?: SignupHandler;
}

function CadastroForm({ onSignup }: CadastroFormProps) {
  const {
    cadastroData,
    isLoading,
    mensagem,
    cadastroConcluido,
    showSenha,
    setShowSenha,
    handleChange,
    handleSubmit
  } = useCadastro();

  return (
    <div className="form-container sign-up w-full flex items-center justify-center">

      <form
        onSubmit={(e) => handleSubmit(e, onSignup)}
        className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center w-full max-w-[400px] shadow-lg"
      >
        <h1 className="text-[#1565C0] text-2xl font-bold mb-4">Cadastrar</h1>

        {mensagem && (
          <div
            className={`w-full p-2 rounded mb-3 text-center text-sm transition-colors duration-200 ${
              mensagem.includes("sucesso") ? "text-[#1565C0]" : "text-red-700"
            }`}
          >
            {mensagem}
          </div>
        )}

        {!cadastroConcluido && (
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSenha ? <HiEye size={18} /> : <HiEyeOff size={18} />}
              </button>
            </div>

            <div className="w-full flex justify-center mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="font-bold px-8 py-2 rounded-lg border-none"
              style={{
                background: 'linear-gradient(135deg, #ffaf00, #ffe0b2)',
                color: '#0a192f',
                boxShadow: '0 0 30px rgba(255,175,0,0.3)',
              }}
            >
              {isLoading ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </div>



          </div>
        )}
      </form>
    </div>
  );
}

export default CadastroForm;