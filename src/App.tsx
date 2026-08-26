import { useState, useEffect, useCallback } from 'react';
import type { FontSizeMode, ThemeMode } from './components/header/AppHeader';
import type { ItemCosteo, TasasCosteo, CostingTab, CategoriaDef } from './types/costing';
import { INITIAL_COSTING_ITEMS, INITIAL_TASAS_COSTEO, DEFAULT_CATEGORIES } from './utils/initialCostingData';

// Capa de Base de Datos Local & Sincronización Cloud
import { db } from './db/costingDb';
import { syncService } from './services/syncService';

// Layout & Views del Software de Costeo
import { CostingSidebar } from './components/layout/CostingSidebar';
import { CostingNavbar } from './components/layout/CostingNavbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HojaCosteoView } from './components/views/HojaCosteoView';
import { PizarraPreciosView } from './components/views/PizarraPreciosView';
import { CostingConfiguracionView } from './components/views/CostingConfiguracionView';
import { CosteoItemModal } from './components/modals/CosteoItemModal';
import { HelpModal } from './components/modals/HelpModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  // ─── TEMA Y ACCESIBILIDAD ──────────────────────────────────────────
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('feria_cotizador_theme') as ThemeMode) || 'dark';
  });
  const [fontSize, setFontSize] = useState<FontSizeMode>(() => {
    return (localStorage.getItem('feria_cotizador_fontsize') as FontSizeMode) || 'normal';
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('feria_cotizador_highcontrast') === 'true';
  });

  // ─── NAVEGACIÓN PRINCIPAL ───────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<CostingTab>('hoja_costeo');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // ─── CATEGORÍAS PERSONALIZADAS ──────────────────────────────────────
  const [customCategories, setCustomCategories] = useState<CategoriaDef[]>(() => {
    try {
      const saved = localStorage.getItem('feria_costing_custom_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // ─── DATOS DE COSTEO Y TASAS ────────────────────────────────────────
  const [items, setItems] = useState<ItemCosteo[]>(() => {
    try {
      const saved = localStorage.getItem('feria_costing_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_COSTING_ITEMS;
    } catch {
      return INITIAL_COSTING_ITEMS;
    }
  });

  const [tasas, setTasas] = useState<TasasCosteo>(() => {
    try {
      const saved = localStorage.getItem('feria_costing_tasas');
      return saved ? JSON.parse(saved) : INITIAL_TASAS_COSTEO;
    } catch {
      return INITIAL_TASAS_COSTEO;
    }
  });

  // ─── MODALES ────────────────────────────────────────────────────────
  const [isCosteoModalOpen, setIsCosteoModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ItemCosteo | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);

  const [familyPhone, setFamilyPhone] = useState<string>(() => {
    return localStorage.getItem('feria_cotizador_family_phone') || '04120000000';
  });
  const [familyName, setFamilyName] = useState<string>(() => {
    return localStorage.getItem('feria_cotizador_family_name') || 'Familiar / Encargado';
  });

  // ─── TOAST NOTIFICATIONS ───────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // ─── INICIALIZACIÓN DE BASE DE DATOS INDEXEDDB & SYNC SERVICE ───────
  useEffect(() => {
    let isMounted = true;

    async function bootstrapDatabase() {
      try {
        const loaded = await db.initializeDatabase();
        if (isMounted) {
          if (loaded.items && loaded.items.length > 0) {
            setItems(loaded.items);
          }
          if (loaded.tasas) {
            setTasas(loaded.tasas);
          }
          if (loaded.categorias && loaded.categorias.length > 0) {
            setCustomCategories(loaded.categorias);
          }
        }

        // Inicializar sincronización con Supabase si está configurado
        await syncService.init();
      } catch (err) {
        console.warn('Aviso inicializando almacenamiento IndexedDB:', err);
      }
    }

    bootstrapDatabase();

    // Escuchar actualizaciones remotas de Supabase en tiempo real
    const unsubRemote = syncService.subscribeRemoteData(data => {
      if (data.items) {
        setItems(data.items);
        showToast('🔄 Rubros actualizados en tiempo real desde la nube.');
      }
      if (data.tasas) {
        setTasas(data.tasas);
        showToast('🔄 Tasas actualizadas en tiempo real desde la nube.');
      }
      if (data.categorias) {
        setCustomCategories(data.categorias);
      }
    });

    return () => {
      isMounted = false;
      unsubRemote();
    };
  }, [showToast]);

  // ─── PERSISTENCIA SECUNDARIA Y CONFIGURACIONES DE UI ────────────────
  useEffect(() => {
    localStorage.setItem('feria_costing_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('feria_costing_tasas', JSON.stringify(tasas));
  }, [tasas]);

  useEffect(() => {
    localStorage.setItem('feria_costing_custom_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('feria_cotizador_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('feria_cotizador_fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('feria_cotizador_highcontrast', String(highContrast));
  }, [highContrast]);

  // ─── ACCIONES DE COSTEO Y CATEGORÍAS (INDEXEDDB + CLOUD SYNC) ──────
  const handleSaveItem = async (itemToSave: ItemCosteo) => {
    setItems(prev => {
      const exists = prev.some(i => i.id === itemToSave.id);
      if (exists) {
        return prev.map(i => (i.id === itemToSave.id ? itemToSave : i));
      }
      return [itemToSave, ...prev];
    });

    try {
      await db.saveItem(itemToSave);
      syncService.scheduleSync(300);
    } catch (e) {
      console.warn('Error guardando rubro en IndexedDB:', e);
    }

    showToast(`✅ ${itemToSave.nombre} guardado correctamente.`);
  };

  const handleDeleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await db.deleteItem(id);
      syncService.scheduleSync(300);
    } catch (e) {
      console.warn('Error eliminando rubro en IndexedDB:', e);
    }
    showToast('🗑️ Rubro eliminado de la hoja de costeo.');
  };

  const handleAddCategory = async (newCat: CategoriaDef) => {
    let updated: CategoriaDef[] = [];
    setCustomCategories(prev => {
      if (prev.some(c => c.nombre.toLowerCase() === newCat.nombre.toLowerCase())) {
        return prev;
      }
      updated = [...prev, newCat];
      return updated;
    });

    if (updated.length > 0) {
      try {
        await db.saveCategorias(updated);
        syncService.scheduleSync(300);
      } catch (e) {
        console.warn('Error guardando categoría en IndexedDB:', e);
      }
    }

    showToast(`✨ Categoría "${newCat.nombre}" agregada.`);
  };

  const handleDeleteCategory = async (catId: string) => {
    const updated = customCategories.filter(c => c.id !== catId);
    setCustomCategories(updated);
    try {
      await db.saveCategorias(updated);
      syncService.scheduleSync(300);
    } catch (e) {
      console.warn('Error eliminando categoría en IndexedDB:', e);
    }
    showToast('🗑️ Categoría eliminada.');
  };

  const handleUpdateItemMargin = async (id: string, newMargin: number) => {
    const updatedItems = items.map(i => (i.id === id ? { ...i, margenPorcentaje: newMargin } : i));
    setItems(updatedItems);
    const targetItem = updatedItems.find(i => i.id === id);
    if (targetItem) {
      await db.saveItem(targetItem);
      syncService.scheduleSync(500);
    }
  };

  const handleBatchUpdateMargins = async (newMargin: number) => {
    const updatedItems = items.map(i => ({ ...i, margenPorcentaje: newMargin }));
    setItems(updatedItems);
    await db.bulkSaveItems(updatedItems);
    syncService.scheduleSync(300);
    showToast(`✅ Margen de todos los rubros ajustado al ${newMargin}%.`);
  };

  const handleResetDefaultItems = async () => {
    setItems(INITIAL_COSTING_ITEMS);
    await db.items.clear();
    await db.bulkSaveItems(INITIAL_COSTING_ITEMS);
    syncService.scheduleSync(300);
    showToast('🔄 Lista de rubros restaurada a valores iniciales.');
  };

  const handleUpdateTasas = async (newTasas: Partial<TasasCosteo>, showToastFeedback = false) => {
    const updated: TasasCosteo = {
      ...tasas,
      ...newTasas,
      fechaActualizacion: new Date().toISOString()
    };
    setTasas(updated);
    try {
      await db.saveTasas(updated);
      syncService.scheduleSync(500);
    } catch (e) {
      console.warn('Error guardando tasas en IndexedDB:', e);
    }
    if (showToastFeedback) {
      showToast('💾 Configuración de tasas actualizada.');
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleCycleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'normal') return 'grande';
      if (prev === 'grande') return 'extra';
      return 'normal';
    });
  };

  const handleSaveFamilyContact = (name: string, phone: string) => {
    setFamilyName(name);
    setFamilyPhone(phone);
    localStorage.setItem('feria_cotizador_family_name', name);
    localStorage.setItem('feria_cotizador_family_phone', phone);
    showToast('💾 Contacto de confianza guardado.');
  };

  const handleDataRestoredFromBackup = (data: { items: ItemCosteo[]; tasas: TasasCosteo; categorias: CategoriaDef[] }) => {
    if (data.items) setItems(data.items);
    if (data.tasas) setTasas(data.tasas);
    if (data.categorias) setCustomCategories(data.categorias);
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen min-h-[100dvh] bg-gray-50 dark:bg-[#070c1a] flex font-sans antialiased text-gray-900 dark:text-white transition-colors duration-200`}>
        
        {/* ─── SIDEBAR ESPECIALIZADO (DESKTOP + DRAWER MÓVIL) ─────────── */}
        <CostingSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          tasas={tasas}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        />

        {/* ─── CONTENIDO PRINCIPAL ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen h-[100dvh] overflow-hidden">
          
          {/* Barra Superior */}
          <CostingNavbar
            activeTab={activeTab}
            tasas={tasas}
            theme={theme}
            fontSize={fontSize}
            onToggleTheme={handleToggleTheme}
            onCycleFontSize={handleCycleFontSize}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
            onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          />

          {/* Vistas Dinámicas según la pestaña activa */}
          <main className="flex-1 flex flex-col overflow-y-auto touch-scroll">
            {activeTab === 'hoja_costeo' && (
              <HojaCosteoView
                items={items}
                tasas={tasas}
                customCategories={customCategories}
                onOpenCreateModal={() => {
                  setEditingItem(null);
                  setIsCosteoModalOpen(true);
                }}
                onOpenEditModal={item => {
                  setEditingItem(item);
                  setIsCosteoModalOpen(true);
                }}
                onDeleteItem={handleDeleteItem}
                onUpdateItemMargin={handleUpdateItemMargin}
                onBatchUpdateMargins={handleBatchUpdateMargins}
                onResetDefaultItems={handleResetDefaultItems}
                onNavigateTab={setActiveTab}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'pizarra_precios' && (
              <PizarraPreciosView
                items={items}
                tasas={tasas}
                onNavigateTab={setActiveTab}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'configuracion' && (
              <CostingConfiguracionView
                tasas={tasas}
                fontSize={fontSize}
                highContrast={highContrast}
                items={items}
                customCategories={customCategories}
                onUpdateTasas={handleUpdateTasas}
                onFontSizeChange={setFontSize}
                onToggleHighContrast={() => setHighContrast(!highContrast)}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
                onShowToast={showToast}
              />
            )}
          </main>
        </div>

        {/* ─── BARRA DE NAVEGACIÓN INFERIOR MÓVIL (iOS & ANDROID) ────── */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenCreateModal={() => {
            setEditingItem(null);
            setIsCosteoModalOpen(true);
          }}
          onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          tasas={tasas}
        />

        {/* ─── MODALES ───────────────────────────────────────────────── */}
        {isCosteoModalOpen && (
          <CosteoItemModal
            isOpen={isCosteoModalOpen}
            onClose={() => {
              setIsCosteoModalOpen(false);
              setEditingItem(null);
            }}
            editingItem={editingItem}
            tasas={tasas}
            customCategories={customCategories}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onAddCustomCategory={handleAddCategory}
          />
        )}

        {isHelpModalOpen && (
          <HelpModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            familyPhone={familyPhone}
            familyName={familyName}
            onSaveFamilyContact={handleSaveFamilyContact}
          />
        )}

        {isDatabaseModalOpen && (
          <SupabaseConfigModal
            isOpen={isDatabaseModalOpen}
            onClose={() => setIsDatabaseModalOpen(false)}
            onDataRestored={handleDataRestoredFromBackup}
            onShowToast={showToast}
          />
        )}

        {/* ─── TOAST NOTIFICATION RESPONSIVA ─────────────────────────── */}
        {toastMessage && (
          <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 bg-gray-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 text-xs sm:text-sm font-bold animate-fade-in flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}

export default App;
