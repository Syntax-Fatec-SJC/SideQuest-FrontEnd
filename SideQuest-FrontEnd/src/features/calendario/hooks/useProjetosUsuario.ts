import { useState, useCallback, useEffect } from "react";
import { projetoService } from "../../../services/ProjetoService";
import { tratarErro } from "../../../shared/errors";
import type { Projeto } from "../../../types/Projeto";
import type { ApiError } from "../../../shared/errors/ApiError";

export function useProjetosUsuario(isAutenticado: boolean) {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<ApiError | null>(null);

  const carregarDados = useCallback(async () => {
    if (!isAutenticado) {
      setProjetos([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const data = await projetoService.listarProjetosDoUsuario();
      setProjetos(data ?? []);
    } catch (e: unknown) {
      const apiErro = tratarErro(e);
      setErro(apiErro);
      setProjetos([]);
    } finally {
      setCarregando(false);
    }
  }, [isAutenticado]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  return { projetos, carregando, erro, carregarDados };
}
