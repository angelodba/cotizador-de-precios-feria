import React from 'react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="text-center py-4 px-4 text-xs sm:text-sm text-slate-400 border-t border-slate-800/80 mt-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
      <div>
        Cotizador de Precios Independiente — <strong>Feria de Hortalizas Los Cafeteros</strong>
      </div>
      <div className="text-slate-400 flex items-center gap-2">
        <span>Diseño Universal & Gerontotecnología</span>
        <span>•</span>
        <span>Accesibilidad 100%</span>
      </div>
    </footer>
  );
};
