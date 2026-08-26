import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  CheckCircle,
  Eye,
  X,
  Trash2,
  Receipt
} from 'lucide-react';
import type { ClientDebtor } from '../../types/navigation';
import type { CotizadorRates } from '../../types/cotizador';
import { CotizadorCalculator, roundSafe } from '../../utils/cotizadorCalculator';

interface CobranzaViewProps {
  debtors: ClientDebtor[];
  rates: CotizadorRates;
  onAddDebtor: (debtor: ClientDebtor) => void;
  onSettleDebtor: (debtorId: string) => void;
  onAddPaymentToDebtor: (debtorId: string, amountVES: number, concepto?: string) => void;
  onDeleteDebtor: (debtorId: string) => void;
  onShowToast: (msg: string) => void;
}

export const CobranzaView: React.FC<CobranzaViewProps> = ({
  debtors,
  rates,
  onAddDebtor,
  onSettleDebtor,
  onAddPaymentToDebtor,
  onDeleteDebtor,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [selectedDebtorForDetails, setSelectedDebtorForDetails] = useState<ClientDebtor | null>(null);
  const [abonoAmountInput, setAbonoAmountInput] = useState<number | ''>('');
  const [abonoConceptoInput, setAbonoConceptoInput] = useState<string>('Abono en efectivo');

  // Filtrar clientes
  const filteredDebtors = debtors.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.nombre.toLowerCase().includes(q) ||
      (d.cedula && d.cedula.toLowerCase().includes(q)) ||
      (d.telefono && d.telefono.includes(q))
    );
  });

  const totalDeudaVES = debtors.reduce((sum, d) => sum + d.deudaVES, 0);
  const totalDeudaUSD = debtors.reduce((sum, d) => sum + d.deudaUSD, 0);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      
      {/* HEADER EXACTO DE BODEGAPP */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Cuentas por Cobrar
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Gestiona los fiados y registra abonos de tus clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase">Total por Cobrar</span>
            <span className="text-sm font-extrabold text-red-600 dark:text-red-400">
              {CotizadorCalculator.formatBCV(totalDeudaVES)} ({CotizadorCalculator.formatUSD(totalDeudaUSD)})
            </span>
          </div>

          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-xl font-bold text-sm shadow-md shadow-blue-950/30 transition-transform active:scale-95 cursor-pointer min-h-[44px]"
          >
            <UserPlus size={18} />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </header>

      {/* BARRA DE BÚSQUEDA PROMINENTE */}
      <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-[#1e3256] mb-6 sticky top-0 z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente por nombre, cédula o teléfono..."
            className="block w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-slate-700 rounded-xl leading-5 bg-gray-50 dark:bg-[#131b2e] text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE CLIENTES CON FIADOS (ESTILO EXACTO BODEGAPP) */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredDebtors.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-[#1e3256] p-8 shadow-sm">
            <Receipt size={48} className="mx-auto text-gray-400 mb-3 opacity-60" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              No hay clientes que coincidan
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No se encontró ningún registro para "${searchQuery}".`
                : 'Comienza añadiendo un cliente o registrando una venta a crédito.'}
            </p>
          </div>
        ) : (
          filteredDebtors.map(debtor => {
            const initialLetter = debtor.nombre.trim().charAt(0).toUpperCase() || 'C';
            const hasDebt = debtor.deudaVES > 0;

            return (
              <div
                key={debtor.id}
                className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Lado Izquierdo: Avatar Circular con Inicial y Datos */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-700 dark:text-blue-300 font-black text-lg shrink-0 shadow-inner">
                    {initialLetter}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight uppercase truncate" title={debtor.nombre}>
                      {debtor.nombre}
                    </h3>
                    <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5 flex-wrap">
                      <span>&lt;/&gt; {debtor.cedula || 'Sin C.I.'}</span>
                      <span>•</span>
                      <span>📞 {debtor.telefono || 'Sin Tlf'}</span>
                      {debtor.direccion && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{debtor.direccion}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Deuda Total y Botones de Acción (Saldar y Detalles) */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
                      DEUDA TOTAL
                    </span>
                    <span className={`text-base sm:text-lg font-black block tracking-tight ${
                      hasDebt ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {CotizadorCalculator.formatBCV(debtor.deudaVES)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold block">
                      ({CotizadorCalculator.formatUSD(debtor.deudaUSD)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasDebt ? (
                      <button
                        onClick={() => {
                          onSettleDebtor(debtor.id);
                          onShowToast(`✅ Deuda de ${debtor.nombre} saldada por completo.`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 min-h-[38px] active:scale-95 cursor-pointer"
                        title="Marcar toda la deuda como pagada"
                      >
                        <CheckCircle size={15} />
                        <span>Saldar</span>
                      </button>
                    ) : (
                      <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60">
                        Al día
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedDebtorForDetails(debtor)}
                      className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 transition-all flex items-center gap-1.5 min-h-[38px] cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>Detalles</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: AÑADIR NUEVO CLIENTE CON FIADO */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto animate-fade-in text-gray-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" />
                <span>Añadir Nuevo Cliente</span>
              </h2>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.currentTarget;
                const nombre = (form.elements.namedItem('nombre') as HTMLInputElement).value;
                const cedula = (form.elements.namedItem('cedula') as HTMLInputElement).value;
                const telefono = (form.elements.namedItem('telefono') as HTMLInputElement).value;
                const direccion = (form.elements.namedItem('direccion') as HTMLInputElement).value;
                const deudaVES = parseFloat((form.elements.namedItem('deudaVES') as HTMLInputElement).value) || 0;
                const concepto = (form.elements.namedItem('concepto') as HTMLInputElement).value || 'Fiado inicial';

                const newDebtor: ClientDebtor = {
                  id: `deb-${Date.now()}`,
                  nombre: nombre.toUpperCase(),
                  cedula: cedula || undefined,
                  telefono: telefono || undefined,
                  direccion: direccion || undefined,
                  deudaVES: deudaVES,
                  deudaUSD: roundSafe(deudaVES / (rates.bcv || 76.50), 2),
                  fechaRegistro: new Date().toLocaleDateString('es-VE'),
                  historial: deudaVES > 0 ? [
                    {
                      id: `hist-${Date.now()}`,
                      fecha: new Date().toLocaleDateString('es-VE'),
                      concepto: concepto,
                      montoVES: deudaVES,
                      montoUSD: roundSafe(deudaVES / (rates.bcv || 76.50), 2),
                      tipo: 'cargo'
                    }
                  ] : []
                };

                onAddDebtor(newDebtor);
                setIsNewClientModalOpen(false);
                onShowToast(`✅ Cliente ${newDebtor.nombre} registrado con éxito.`);
              }}
              className="flex flex-col gap-3.5 text-xs sm:text-sm"
            >
              <div>
                <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Nombre Completo *</label>
                <input
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ej. WALTER FABRICA / SR MANUEL"
                  className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Cédula (Opcional)</label>
                  <input
                    name="cedula"
                    type="text"
                    placeholder="V-12345678"
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Teléfono (Opcional)</label>
                  <input
                    name="telefono"
                    type="tel"
                    placeholder="0414-1234567"
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Dirección / Puesto (Opcional)</label>
                <input
                  name="direccion"
                  type="text"
                  placeholder="Ej. Puesto 14 / Galpón Central"
                  className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
                />
              </div>

              <div className="bg-slate-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <label className="font-bold text-gray-700 dark:text-slate-200 block">Deuda Inicial (Bolívares Bs)</label>
                <input
                  name="deudaVES"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-gray-900 dark:text-red-400 outline-none focus:border-blue-500 text-sm"
                />

                <input
                  name="concepto"
                  type="text"
                  placeholder="Concepto del fiado (ej. 2 Cestas de Tomate)"
                  className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-xs text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl min-h-[42px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-950/30 min-h-[42px]"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETALLES, HISTORIAL Y REGISTRO DE ABONOS */}
      {selectedDebtorForDetails && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto animate-fade-in text-gray-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300 font-black">
                  {selectedDebtorForDetails.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg uppercase">
                    {selectedDebtorForDetails.nombre}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    Registrado el {selectedDebtorForDetails.fechaRegistro}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDebtorForDetails(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Resumen Deuda Actual */}
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">Saldo Pendiente</span>
                <div className="text-2xl font-black text-red-600 dark:text-red-400">
                  {CotizadorCalculator.formatBCV(selectedDebtorForDetails.deudaVES)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Equivalente Dólares</span>
                <div className="text-base font-extrabold text-gray-700 dark:text-slate-200">
                  {CotizadorCalculator.formatUSD(selectedDebtorForDetails.deudaUSD)}
                </div>
              </div>
            </div>

            {/* Formulario de Registrar Abono Parcial */}
            {selectedDebtorForDetails.deudaVES > 0 && (
              <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase">
                  Registrar Abono a la Cuenta:
                </span>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    max={selectedDebtorForDetails.deudaVES}
                    value={abonoAmountInput}
                    onChange={e => setAbonoAmountInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="Monto en Bs. (ej. 500)"
                    className="flex-1 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-sm text-gray-900 dark:text-white outline-none"
                  />

                  <input
                    type="text"
                    value={abonoConceptoInput}
                    onChange={e => setAbonoConceptoInput(e.target.value)}
                    placeholder="Concepto (ej. Pago Móvil)"
                    className="flex-1 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white outline-none"
                  />
                  
                  <button
                    type="button"
                    onClick={() => {
                      const amount = typeof abonoAmountInput === 'number' ? abonoAmountInput : 0;
                      if (amount <= 0) return;
                      onAddPaymentToDebtor(selectedDebtorForDetails.id, amount, abonoConceptoInput);
                      onShowToast(`💵 Abono de ${CotizadorCalculator.formatBCV(amount)} registrado.`);
                      setAbonoAmountInput('');
                      setSelectedDebtorForDetails(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shrink-0 shadow-sm min-h-[40px]"
                  >
                    Abonar
                  </button>
                </div>
              </div>
            )}

            {/* Historial de Movimientos */}
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase block mb-2">
                Historial de Movimientos
              </span>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {selectedDebtorForDetails.historial.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No hay movimientos registrados.</p>
                ) : (
                  selectedDebtorForDetails.historial.map(item => (
                    <div
                      key={item.id}
                      className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{item.concepto}</div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400">{item.fecha}</div>
                      </div>
                      <div className={`font-black text-right ${
                        item.tipo === 'cargo' ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {item.tipo === 'cargo' ? '+' : '-'}{CotizadorCalculator.formatBCV(item.montoVES)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Eliminar cliente ${selectedDebtorForDetails.nombre}?`)) {
                    onDeleteDebtor(selectedDebtorForDetails.id);
                    setSelectedDebtorForDetails(null);
                    onShowToast('🗑️ Cliente eliminado.');
                  }
                }}
                className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 size={15} />
                <span>Eliminar Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDebtorForDetails(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
