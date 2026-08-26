/**
 * Utilidades lógicas especializadas para compatibilidad 100% con iOS Safari y Android Chrome / PWA
 */

/**
 * Parsea cualquier entrada numérica (string con comas, puntos, espacios, símbolos de moneda)
 * Soluciona el error clásico de iOS donde los teclados latinoamericanos/europeos introducen comas (ej. "12,5" -> 12.5)
 */
export function parseLocaleNumber(val: any, fallback: number = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : fallback;
  }

  const str = String(val).trim();
  if (!str) return fallback;

  // Limpiar espacios y símbolos monetarios
  let cleaned = str
    .replace(/[$BsCOPcopUSDTusdt\s\u00A0\u202F]/g, '')
    .trim();

  // Si tiene tanto punto como coma (ej. 1.200,50 o 1,200.50)
  if (cleaned.includes('.') && cleaned.includes(',')) {
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Formato latinoamericano: 1.200,50 -> 1200.50
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato anglosajón: 1,200.50 -> 1200.50
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Solo tiene coma (ej. "12,5" o "90,000")
    // Si la coma separa 3 dígitos al final de un número grande (ej "90,000"), podría ser miles, pero en costeo de feria suele ser decimal o valor entero
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Decimal: "12,5" -> "12.5"
      cleaned = cleaned.replace(',', '.');
    } else if (parts.length === 2 && parts[1].length === 3 && Number(parts[0]) > 0 && Number(parts[0]) < 1000) {
      // Podría ser miles: "90,000" -> "90000"
      cleaned = cleaned.replace(',', '');
    } else {
      cleaned = cleaned.replace(',', '.');
    }
  }

  const result = parseFloat(cleaned);
  return Number.isFinite(result) ? result : fallback;
}

/**
 * Descarga universal de archivos (CSV, JSON, etc.) compatible con iOS Safari, iPadOS y Android
 */
export function downloadFileMobile(content: string, fileName: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  try {
    const blob = new Blob([content], { type: mimeType });

    // Para navegadores modernos y Android Chrome
    if (typeof window !== 'undefined' && 'URL' in window && 'createObjectURL' in window.URL) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.setAttribute('target', '_blank');
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Limpiar URL después de un breve delay para iOS
      setTimeout(() => {
        try {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch {
          // Ignorar si ya fue removido
        }
      }, 500);
      return;
    }

    // Fallback con Data URI si Blob URL no está disponible
    const encodedUri = `data:${mimeType},${encodeURIComponent(content)}`;
    const fallbackLink = document.createElement('a');
    fallbackLink.setAttribute('href', encodedUri);
    fallbackLink.setAttribute('download', fileName);
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
  } catch (err) {
    console.warn('Fallback al abrir en nueva ventana para descarga:', err);
    // Fallback extremo para navegadores móviles restrictivos
    window.open(`data:${mimeType},${encodeURIComponent(content)}`, '_blank');
  }
}

/**
 * Copiado al portapapeles con sincronía estricta para iOS Safari
 */
export async function copyToClipboardMobile(text: string): Promise<boolean> {
  if (!text) return false;

  // Intentar API moderna de Clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continuar al fallback síncrono si falla
    }
  }

  // Fallback con textarea oculto compatible con iOS Safari y Android WebViews
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Compartir nativo en iOS y Android con Web Share API y fallback a WhatsApp
 */
export async function shareMobileOrWhatsApp(title: string, text: string): Promise<{ shared: boolean; method: 'native' | 'whatsapp' }> {
  // Intentar Web Share API nativa si está disponible (iPhone / Android)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text
      });
      return { shared: true, method: 'native' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // El usuario canceló el diálogo de compartir
        return { shared: false, method: 'native' };
      }
      // Si falla por permisos, continuar al fallback
    }
  }

  // Fallback directo a WhatsApp
  const encoded = encodeURIComponent(text);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  return { shared: true, method: 'whatsapp' };
}

/**
 * Vibración háptica suave en dispositivos móviles (compatible con Android, seguro en iOS)
 */
export function hapticFeedback(type: 'light' | 'medium' | 'success' | 'warning' = 'light'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'success':
        navigator.vibrate([15, 40, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
    }
  } catch {
    // Silencioso si no está permitido
  }
}

/**
 * Detecta si el dispositivo es iOS (iPhone, iPad, iPod)
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detecta si el dispositivo es Android
 */
export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Detecta si la app está corriendo como PWA instalada (Standalone)
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}
