import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usuarioService } from "../../../services/AuthService";
import useAuth from "../../../shared/hooks/useAuth";
import type { Login, LoginHandler } from "../../../types/Auth";

interface LoginData {
  email: string;
  password: string;
}

interface UseLoginReturn {
  loginData: LoginData;
  setLoginData: React.Dispatch<React.SetStateAction<LoginData>>;
  isLoading: boolean;
  mensagem: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, onLogin?: LoginHandler) => Promise<void>;
}

export function useLogin(): UseLoginReturn {
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onLogin?: LoginHandler) => {
    e.preventDefault();
    setMensagem("");

    if (onLogin) {
      try {
        const handled = await Promise.resolve(onLogin(loginData));
        if (handled === true) return;
      } catch (err) {
        console.error("onLogin handler threw an error:", err);
      }
    }

    setIsLoading(true);
    try {
      const dadosParaLogin: Login = {
        email: loginData.email,
        senha: loginData.password,
      };

      const resposta = await usuarioService.realizarLogin(dadosParaLogin);

      if (resposta.token) {
        localStorage.setItem("token", resposta.token);
      }

      const usuarioSessao = {
        id: resposta.id,
        nome: resposta.nome,
        email: resposta.email,
      };

      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioSessao));
      localStorage.setItem("usuario", JSON.stringify(usuarioSessao));
      localStorage.setItem("usuarioId", usuarioSessao.id);

      refresh();

      setMensagem("Login realizado com sucesso!");

      setTimeout(() => {
        navigate("/projetos");
      }, 1000);
    } catch (error) {
      console.error("Erro no login", error);
      setMensagem("Email ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  return { loginData, setLoginData, isLoading, mensagem, handleChange, handleSubmit };
}