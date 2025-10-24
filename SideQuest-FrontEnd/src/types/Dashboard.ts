export type AtualizacaoItem = {
  titulo: string;
  descricao: string;
  responsavel: string | string[];
  data: string;
};

export type EntregaItem = {
  titulo: string;
  descricao: string;
  responsavel: string | string[]; 
  data: string;
};

export type PizzaItem = {
  chave: "Pendentes" | "Em Desenvolvimento" | "Concluidas";
  valor: number;
};