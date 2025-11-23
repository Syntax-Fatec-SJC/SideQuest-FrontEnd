import { Component, type ReactNode } from "react";
import { MembrosContainer } from "./containers/MembrosContainer";
import { ProtecaoPage } from "../../shared/components/ProtecaoPage";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro capturado no ErrorBoundary de Membros:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-800 mb-4">Erro ao carregar Membros</h2>
            <p className="text-red-700 mb-4">{this.state.error?.message || "Erro desconhecido"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Membros() {
  return (
    <ErrorBoundary>
      <ProtecaoPage>
        <MembrosContainer />
      </ProtecaoPage>
    </ErrorBoundary>
  );
}