// Usuario
export type Usuario = {
    nome: string;
    email: string;
    senha: string;
}

// Usuario completo
export type UsuarioCompleto = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  projetosIds?: string[];
  tarefasIds?: string[];
}

// Login
export type Login = {
    email: string;
    senha: string;
}

// Login Response
export type LoginResponse = {
    id: string;
    nome: string;
    email: string;
    token: string;
}

// Resumo de Usuario
export type UsuarioResumo = {
  id: string;
  nome: string;
  email: string;
}

// Tipos de formulário / handlers específicos da autenticação
// Tipo genérico local para handlers de submit usados pela auth
export type SubmitHandler<T> = (data: T) => void | boolean | Promise<void | boolean>;

// Dados enviados pelo LoginForm (note: usamos `password` no formulário, mapeamos para `senha` internamente)
export type LoginFormData = {
  email: string;
  password: string;
}

// Dados enviados pelo CadastroForm
export type SignupFormData = {
  nome: string;
  email: string;
  senha: string;
}

export type LoginHandler = SubmitHandler<LoginFormData>;
export type SignupHandler = SubmitHandler<SignupFormData>;