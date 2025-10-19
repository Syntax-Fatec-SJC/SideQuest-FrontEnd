export interface ToastData {
  tipo: "erro" | "sucesso" | "info";
  mensagem: string;
}

export type ShowToastFunction = (toast: ToastData) => void;

/**
 * Validações comuns para formulários de projeto
 */
export const validacoesProjeto = {
  validarNome(nome: string, showToast: ShowToastFunction): boolean {
    if (!nome.trim()) {
      showToast({ tipo: "erro", mensagem: "Digite um nome para o projeto." });
      return false;
    }
    return true;
  },

  validarPrazo(prazo: string, showToast: ShowToastFunction): boolean {
    if (!prazo) {
      showToast({ tipo: "erro", mensagem: "Selecione um prazo para o projeto." });
      return false;
    }
    return true;
  },

  validarEmail(email: string, showToast: ShowToastFunction): boolean {
    if (!email.trim()) {
      showToast({ tipo: "erro", mensagem: "Digite um e-mail para adicionar." });
      return false;
    }
    return true;
  }
};

/**
 * Mensagens de sucesso comuns
 */
export const mensagensSucesso = {
  projetoCriado: "Projeto criado com sucesso!",
  usuarioAdicionado: "Usuário adicionado ao projeto.",
  projetoRemovido: "Projeto removido com sucesso!"
};

/**
 * Mensagens de erro comuns
 */
export const mensagensErro = {
  emailInvalido: "E-mail inválido ou conta ainda não cadastrada na plataforma.",
  usuarioJaAdicionado: "Usuário já adicionado ao projeto.",
  criadorAutomatico: "Você já é membro automaticamente como criador do projeto.",
  erroBuscarUsuario: "Erro ao buscar usuário. Tente novamente.",
  sessaoInvalida: "Sessão não identificada. Faça login novamente."
};