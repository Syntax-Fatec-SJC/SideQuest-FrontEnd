export type ErroApi = {
  message: string;
  codigo?: number;
  detalhes?: unknown;
};

export class ApiError extends Error implements ErroApi {
  public codigo?: number;
  public detalhes?: unknown;

  constructor({ message, codigo, detalhes }: ErroApi) {
    super(message);
    this.name = "ApiError";
    this.codigo = codigo;
    this.detalhes = detalhes;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromUnknown(err: unknown): ApiError {
    if (err instanceof ApiError) return err;

    if (err instanceof Error) return new ApiError({ message: err.message });
    if (typeof err === "string") return new ApiError({ message: err });

    return new ApiError({ message: "Erro desconhecido", detalhes: err });
  }
}
