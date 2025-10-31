import { useState, useEffect } from 'react';
import { dashboardService } from '../../../services/DashboardService';
import type { Tarefa } from '../../../types/Tarefa';
import { useToast } from '../../../shared/hooks/useToast';

export function useProximasEntregas() {
  const [entregas, setEntregas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { show } = useToast();

  useEffect(() => {
    async function carregarEntregas() {
      setLoading(true);
      setErro(null);

      try {
        const dados = await dashboardService.listarProximasEntregas();
        setEntregas(dados);
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Erro ao carregar próximas entregas';
        setErro(mensagem);
        show({ mensagem, tipo: 'erro' });
        console.error('Erro ao carregar entregas:', error);
      } finally {
        setLoading(false);
      }
    }

    void carregarEntregas();
  }, []);

  return { entregas, loading, erro };
}
