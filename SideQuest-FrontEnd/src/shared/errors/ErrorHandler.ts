import { ApiError } from "./ApiError";

type OpcoesTratamentoErro = {
  aoLogar?: (erro: ApiError) => void; 
};

export function tratarErro(err: unknown, opcoes?: OpcoesTratamentoErro): ApiError {
  const erro = ApiError.fromUnknown(err);


  if (opcoes?.aoLogar) {
    opcoes.aoLogar(erro);
  } else {
    console.error(erro);
  }
  return erro; 
}
