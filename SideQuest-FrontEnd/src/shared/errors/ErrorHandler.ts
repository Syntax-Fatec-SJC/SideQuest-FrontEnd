import { ApiError } from "./ApiError";

type OpcoesTratamentoErro = {
  aoLogar?: (erro: ApiError) => void;
};

export function tratarErro(err: unknown, opcoes?: OpcoesTratamentoErro): ApiError {
  const erro = ApiError.fromUnknown(err);

  if (erro.codigo === 500) {
    erro.message = "Erro no servidor. Tente novamente mais tarde.";
  } else if (erro.message === "Failed to fetch" || erro.message.includes("fetch")) {
    erro.message = "Erro de conectividade. Verifique sua conexão com o servidor.";
  }

  if (opcoes?.aoLogar) {
    opcoes.aoLogar(erro);
  } else {
    console.error(erro);
  }

  return erro;
}
