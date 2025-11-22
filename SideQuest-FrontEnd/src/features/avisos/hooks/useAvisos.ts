import { useState, useEffect } from 'react';
import AvisoService from '../../../services/AvisoService';
import useAuth from '../../../shared/hooks/useAuth';
import type { Aviso } from '../../../types/Aviso';
import { useToast } from '../../../shared/hooks/useToast';

/**
 * Hook customizado para gerenciar avisos
 */
export const useAvisos = () => {
  const { isAutenticado, usuario } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    if (!isAutenticado || !usuario?.id) {
      setCarregando(false);
      return;
    }

    const carregarAvisos = async () => {
      try {
        setCarregando(true);
        const dados = await AvisoService.listarPorUsuario(usuario.id);
        setAvisos(dados);
      } catch (error) {
        console.error('Erro ao carregar avisos:', error);
        show({ tipo: 'erro', mensagem: 'Erro ao carregar avisos' });
      } finally {
        setCarregando(false);
      }
    };

    void carregarAvisos();
  }, [isAutenticado, usuario?.id, show]);

  const marcarComoVisualizado = async (avisoId: string) => {
    try {
      await AvisoService.marcarComoVisualizado(avisoId);
      setAvisos(prev =>
        prev.map(a =>
          a.id === avisoId ? { ...a, visualizado: true } : a
        )
      );
    } catch (error) {
      console.error('Erro ao marcar aviso como visualizado:', error);
      throw error;
    }
  };

  return {
    avisos,
    carregando,
    marcarComoVisualizado
  };
};
