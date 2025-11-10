import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtecaoPageProps {
  children: ReactNode;
}

export function ProtecaoPage({ children }: ProtecaoPageProps) {
  const { isAutenticado, usuario } = useAuth();
  const navigate = useNavigate();

  if (!isAutenticado || !usuario) {
    return (
      <div className="flex h-screen relative">
        <div className="flex-1 flex flex-col bg-white rounded-3xl p-4 sm:p-8 mt-8 mb-20 sm:mb-8 mx-2 sm:mx-4 text-center justify-center items-center">
          <p className="mb-4">Sessão não identificada. Faça login novamente.</p>
          <button
            onClick={() => navigate("/acesso")}
            className="px-4 py-2 bg-azul-escuro text-white rounded hover:bg-azul-claro transition"
          >
            Ir para login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}