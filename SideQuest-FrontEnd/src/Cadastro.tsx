
import { useState } from "react";
import BotaoGoogle from "./components/BotaoGoogle";
import { HiEye, HiEyeOff } from "react-icons/hi";

function Cadastro() {
  const [showSenha, setShowSenha] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
          Criar conta
        </h2>

        <BotaoGoogle />

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-400">ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>


        <form className="space-y-4 font-bold ">
          <div>
            <label className="block text-blue-900 mb-1" htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              className="w-full px-3 py-2 font-normal text-gray-500 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Digite seu nome"
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-1" htmlFor="sobrenome">
              Sobrenome
            </label>
            <input
              id="sobrenome"
              type="text"
              className="w-full px-3 py-2 font-normal text-gray-500  border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Digite seu sobrenome"
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 font-normal text-gray-500 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-1" htmlFor="senha">
              Senha
            </label>


            <div className="flex">
              <input
                id="senha"
                type={showSenha ? "text" : "password"}
                className="flex-1 px-3 py-2 font-normal text-gray-500 border border-gray-300 rounded-l-lg focus:outline-none"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowSenha(v => !v)}
                className="px-3 border border-gray-300 border-l-0 rounded-r-lg text-gray-500 hover:text-blue-700 flex items-center justify-center"
                aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {showSenha ? <HiEye size={22} /> : <HiEyeOff size={22}  />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition font-semibold"
          >
            Criar conta
          </button>
        </form>
        

      </div>
    </div>
  );
}

export default Cadastro;
