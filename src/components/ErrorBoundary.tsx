import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Ocurrió un error inesperado.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-[#161118] px-6 text-[#FFFDFC]">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#1E1624] p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold">Algo salió mal</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#E7C6D4]">
              No pudimos completar esta operación en este momento. Intenta recargar o volver a empezar.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#BE185D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#9D174D] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
