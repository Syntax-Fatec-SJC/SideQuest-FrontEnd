import type { ReactNode } from "react";

interface ConexaoPageProps {
  erroMensagem?: string; 
  children?: ReactNode;   
  onTentarNovamente?: () => void; 
}

export function ConexaoPage({ erroMensagem, children, onTentarNovamente }: ConexaoPageProps) {
  return (
    <div className="flex h-screen relative">
      <div className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4 text-center justify-center items-center">
        <p className="mb-4 text-red-600 font-semibold">
          {erroMensagem || "Erro de conexão. Verifique sua conexão ou tente novamente mais tarde."}
        </p>

        {onTentarNovamente && (
          <button
            onClick={onTentarNovamente}
            className="px-4 py-2 bg-azul-escuro text-white rounded hover:bg-azul-claro transition"
          >
            Tentar novamente
          </button>
        )}

        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}