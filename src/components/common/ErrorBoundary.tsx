import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Cotizador App:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080d1a] text-white flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-lg w-full text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400">
              <AlertTriangle size={28} />
            </div>
            
            <h2 className="text-xl font-black text-white">
              Se detectó un problema al cargar los datos
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300">
              Es posible que existan datos antiguos en la memoria caché del navegador que requieran reiniciarse.
            </p>

            {this.state.error && (
              <div className="w-full bg-slate-950 p-3 rounded-xl text-left font-mono text-xs text-rose-300 max-h-32 overflow-y-auto border border-slate-800">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 min-h-[46px] border border-emerald-400/40 transition-all cursor-pointer"
            >
              <RotateCcw size={18} />
              <span>Restaurar Datos y Recargar Aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
