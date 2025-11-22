import type { Aviso } from '../../../types/Aviso';

/**
 * Utilitários para formatação de avisos
 */

/**
 * Formata a data e hora do aviso
 */
export const formatarData = (dataString: string): string => {
  try {
    const data = new Date(dataString);
    const dataFormatada = data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const horaFormatada = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dataFormatada} às ${horaFormatada}`;
  } catch {
    return dataString;
  }
};

/**
 * Formata a mensagem do aviso personalizando para o usuário autor
 */
export const formatarMensagem = (aviso: Aviso, usuarioId?: string): string => {
  if (aviso.autorId === usuarioId && aviso.autorNome) {
    let mensagemFormatada = aviso.mensagem.replace(aviso.autorNome, 'Você');
    
    // Para exclusões: "Você excluiu um projeto/tarefa."
    if (mensagemFormatada.includes('excluiu')) {
      mensagemFormatada = mensagemFormatada
        .replace('excluiu um projeto atrelado a você', 'excluiu um projeto')
        .replace('excluiu uma tarefa atrelada a você', 'excluiu uma tarefa');
    }
    
    // Para edições: "Você editou um projeto/tarefa."
    if (mensagemFormatada.includes('editou') || mensagemFormatada.includes('atualizou')) {
      mensagemFormatada = mensagemFormatada
        .replace('editou uma tarefa atrelada a você', 'editou uma tarefa')
        .replace('atualizou um projeto atrelado a você', 'editou um projeto');
    }
    
    // Para atribuições/criações
    if (mensagemFormatada.includes('atrelou')) {
      if (mensagemFormatada.includes('atrelou você') && aviso.usuarioId === usuarioId) {
        mensagemFormatada = mensagemFormatada
          .replace('atrelou você a uma tarefa', 'criou uma tarefa')
          .replace('atrelou você a um projeto', 'criou um projeto');
      }
    }
    
    return mensagemFormatada;
  }
  return aviso.mensagem;
};
