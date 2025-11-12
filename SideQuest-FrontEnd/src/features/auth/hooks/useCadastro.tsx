import { useState } from "react";
import { usuarioService } from "../../../services/AuthService";
import useAuth from "../../../shared/hooks/useAuth";
import type { Usuario, SignupHandler } from "../../../types/Auth";
import { ApiError } from "../../../shared/errors/ApiError";

interface CadastroData {
  nome: string;
  email: string;
  senha: string;
}

interface UseCadastroReturn {
  cadastroData: CadastroData;
  setCadastroData: React.Dispatch<React.SetStateAction<CadastroData>>;
  isLoading: boolean;
  mensagem: string;
  cadastroConcluido: boolean;
  showSenha: boolean;
  setShowSenha: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, onSignup?: SignupHandler) => Promise<void>;
}

export function useCadastro(): UseCadastroReturn {
  const { refresh } = useAuth();

  const [cadastroData, setCadastroData] = useState<CadastroData>({
    nome: "",
    email: "",
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCadastroData({ ...cadastroData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, onSignup?: SignupHandler) => {
    e.preventDefault();
    setMensagem("");

    if (onSignup) {
      try {
        const handled = await Promise.resolve(onSignup(cadastroData));
        if (handled === true) return;
      } catch (err) {
        console.error("onSignup handler threw an error:", err);
      }
    }

    setIsLoading(true);
    try {
      await usuarioService.cadastrarUsuario(cadastroData as Usuario);
      
      setMensagem("Usuário cadastrado com sucesso! Agora faça login para continuar.");
      setCadastroConcluido(true);
      refresh();
    } catch (error) {
      console.error("Erro no cadastro:", error);
      
      if (error instanceof ApiError) {
        if (error.codigo === 409) {
          const errorMessage = error.message || "";
          if (errorMessage.includes("Email já está em uso") || errorMessage.includes("email")) {
            setMensagem("Este email já está cadastrado. Tente fazer login ou use outro email.");
          } else {
            setMensagem("Dados já existem no sistema. Verifique as informações fornecidas.");
          }
        } else if (error.codigo === 400) {
          setMensagem("Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.");
        } else {
          setMensagem("Erro ao cadastrar usuário. Tente novamente.");
        }
      } else {
        setMensagem("Erro ao cadastrar usuário. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cadastroData,
    setCadastroData,
    isLoading,
    mensagem,
    cadastroConcluido,
    showSenha,
    setShowSenha,
    handleChange,
    handleSubmit,
  };
}