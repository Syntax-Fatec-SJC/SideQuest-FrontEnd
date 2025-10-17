import { useState } from "react";
import type { UsuarioResumo } from "../../../types/Auth";
import { usuarioService } from "../../../services/AuthService";
import { obterUsuarioLogadoEmail } from "../utils/usuarioLogado";
import { validacoesProjeto, mensagensErro, mensagensSucesso, type ShowToastFunction } from "../utils/validacoes";

export function useUsuariosProjeto(showToast: ShowToastFunction) {
  const [usuariosAdicionados, setUsuariosAdicionados] = useState<UsuarioResumo[]>([]);
  const [emailDigitado, setEmailDigitado] = useState("");

  const getUsuarioLogadoEmail = obterUsuarioLogadoEmail;

  const handleAddUsuario = async () => {
    const email = emailDigitado.trim().toLowerCase();

    if (!validacoesProjeto.validarEmail(email, showToast)) {
      return;
    }

    const emailLogado = getUsuarioLogadoEmail();
    if (emailLogado && email === emailLogado) {
      showToast({ 
        tipo: "info", 
        mensagem: mensagensErro.criadorAutomatico
      });
      setEmailDigitado("");
      return;
    }

    if (usuariosAdicionados.some((u) => u.email === email)) {
      showToast({ tipo: "info", mensagem: mensagensErro.usuarioJaAdicionado });
      setEmailDigitado("");
      return;
    }

    try {
      const usuarios = await usuarioService.listarUsuarios();
      const usuarioEncontrado = usuarios.find((u) => u.email === email);

      if (!usuarioEncontrado) {
        showToast({
          tipo: "erro",
          mensagem: mensagensErro.emailInvalido,
        });
      } else {
        setUsuariosAdicionados((prev) => [...prev, usuarioEncontrado]);
        showToast({ tipo: "sucesso", mensagem: mensagensSucesso.usuarioAdicionado });
      }

      setEmailDigitado("");
    } catch {
      showToast({
        tipo: "erro",
        mensagem: mensagensErro.erroBuscarUsuario,
      });
    }
  };

  const handleRemoveUsuario = (email: string) => {
    setUsuariosAdicionados((prev) => prev.filter((u) => u.email !== email));
  };

  const resetUsuarios = () => {
    setUsuariosAdicionados([]);
    setEmailDigitado("");
  };

  return {
    usuariosAdicionados,
    setUsuariosAdicionados,
    emailDigitado,
    setEmailDigitado,
    handleAddUsuario,
    handleRemoveUsuario,
    resetUsuarios,
  };
}