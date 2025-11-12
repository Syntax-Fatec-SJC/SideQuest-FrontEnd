import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../../../services/DashboardService';
import type { Tarefa } from '../../../types/Tarefa';
import { tratarErro } from '../../../shared/errors';
import type { ApiError } from '../../../shared/errors/ApiError';

export function useProximasEntregas() {
  const [entregas, setEntregas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dados = await dashboardService.listarProximasEntregas();
      setEntregas(dados);
    } catch (e: unknown) {
      const erro = tratarErro(e);
      setError(erro);
      console.error('Erro ao carregar entregas:', erro);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  return { entregas, loading, error, carregarDados };
}