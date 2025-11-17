import { useState, useEffect, useRef, useCallback } from "react";
import type { UsuarioResumo } from "../../../types/Auth";
import { usuarioService } from "../../../services/AuthService";
import { useToast } from "../../../shared/hooks/useToast";
import { obterUsuarioLogadoEmail } from "../utils/usuarioLogado";

export function useUsuariosProjeto() {
  const { show } = useToast();
  const [usuariosAdicionados, setUsuariosAdicionados] = useState<UsuarioResumo[]>([]);
  const [emailDigitado, setEmailDigitado] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const ultimoErroRef = useRef<string | null>(null);
  const canceladoRef = useRef(false);

  const isErroConectividade = (msg: string) => {
    const texto = msg?.toLowerCase() || "";
    return texto.includes("conectividade") || texto.includes("conexão") || texto.includes("failed to fetch");
  };

  const recarregar = useCallback(async () => {
    canceladoRef.current = false;
    
    // Verificar se há token antes de fazer requisição
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUsuariosAdicionados([]);
      setErro(null);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const usuarios = await usuarioService.listarUsuarios();
      if (canceladoRef.current) return;

      const emailLogado = obterUsuarioLogadoEmail();
      const filtrados = usuarios.filter(u => u.email !== emailLogado);
      setUsuariosAdicionados(filtrados);
      setErro(null);
      ultimoErroRef.current = null;
    } catch (e: unknown) {
      if (canceladoRef.current) return;

      const mensagemErro = (e as Error)?.message || "Falha ao carregar usuários";
      setUsuariosAdicionados([]);
      setErro(mensagemErro);

      if (!isErroConectividade(mensagemErro) && ultimoErroRef.current !== mensagemErro) {
        show({ tipo: "erro", mensagem: mensagemErro });
        ultimoErroRef.current = mensagemErro;
      }
    } finally {
      if (!canceladoRef.current) setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    recarregar();
    return () => { canceladoRef.current = true; };
  }, [recarregar]);

  const adicionarUsuario = (usuario: UsuarioResumo) => {
    setUsuariosAdicionados(prev => [...prev, usuario]);
  };

  const removerUsuario = (email: string) => {
    setUsuariosAdicionados(prev => prev.filter(u => u.email !== email));
  };

  const resetUsuarios = () => {
    setUsuariosAdicionados([]);
    setEmailDigitado("");
  };

  return {
    usuariosAdicionados,
    emailDigitado,
    setEmailDigitado,
    loading,
    erro,
    recarregar,
    adicionarUsuario,
    removerUsuario,
    resetUsuarios,
  };
}
