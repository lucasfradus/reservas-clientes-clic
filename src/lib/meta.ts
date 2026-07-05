// Meta Pixel — helpers para trackear el embudo en la SPA.
//
// El pixel se inicializa en index.html (fbq('init', ...)). Acá solo
// disparamos eventos. Si por algún motivo fbq no existe, todo es no-op.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** PageView de Meta (llamar en cada cambio de ruta de la SPA). */
export function trackMetaPageView(): void {
  window.fbq?.('track', 'PageView');
}

/**
 * Evento estándar de Meta (ViewContent, InitiateCheckout, Purchase, ...).
 *
 * `options` acepta `eventID` para deduplicar contra la Conversions API del
 * backend: si el mismo evento llega por el Pixel y por el servidor con el
 * mismo eventID, Meta lo cuenta una sola vez.
 */
export function trackMetaEvent(
  name: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
): void {
  if (options) {
    window.fbq?.('track', name, params, options);
  } else {
    window.fbq?.('track', name, params);
  }
}
