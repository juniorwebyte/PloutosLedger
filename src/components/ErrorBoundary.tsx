import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message ?? 'Erro desconhecido' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Futuro: enviar para serviço de monitoramento
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-4 m-4 rounded border border-red-300 bg-red-50 text-red-800">
          <p className="font-semibold">Ocorreu um erro inesperado.</p>
          {this.state.errorMessage && (
            <p className="mt-1 text-sm" aria-live="polite">{this.state.errorMessage}</p>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-3 inline-flex items-center rounded bg-red-600 px-3 py-1.5 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;


