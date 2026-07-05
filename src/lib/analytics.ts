// Google Analytics 4 (GA4) — carga diferida y helpers de tracking.
//
// GA se activa SOLO si existe VITE_GA_MEASUREMENT_ID. Sin esa variable
// (por ejemplo en desarrollo) todas las funciones son no-op, así el sitio
// funciona igual sin ensuciar la cuenta de analítica con datos de prueba.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

/** Inyecta gtag.js y configura GA4. Idempotente: solo corre una vez. */
export function initAnalytics(): void {
  if (initialized || !GA_ID || typeof window === 'undefined') return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // La firma canónica de gtag empuja el objeto `arguments` a dataLayer.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // Como es una SPA, enviamos cada page_view a mano al cambiar de ruta.
  window.gtag('config', GA_ID, { send_page_view: false });
}

/** Registra una vista de página (llamar en cada cambio de ruta). */
export function trackPageView(path: string): void {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Registra un evento personalizado (ej: reserva, selección de sede). */
export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
