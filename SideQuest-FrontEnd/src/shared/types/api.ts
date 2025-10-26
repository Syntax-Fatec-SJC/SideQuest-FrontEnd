// Tipos genéricos úteis para padronizar contratos entre frontend e backend
// Coloque aqui tipos que possam ser reutilizados por múltiplas features.

/** Envelope genérico de resposta (use quando a API retornar um envelope) */
export type ApiResponse<T = unknown> = {
	success?: boolean; // opcional — dependerá do backend
	data?: T;
	mensagem?: string; // mensagem curta para exibição
	error?: string | null; // string simples de erro (opcional)
};

/** Estrutura de paginação genérica */
export type Paginated<T> = {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
};


