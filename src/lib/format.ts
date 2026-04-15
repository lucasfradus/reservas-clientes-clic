const TZ = 'America/Argentina/Buenos_Aires';

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return 'Consultar';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDayLong(iso: string): string {
  // "Viernes 18 de abril"
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

export function formatDayShort(iso: string): string {
  // "Vie 18 abr"
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
  return parts.replace(/\./g, '').replace(/^\w/, (c) => c.toUpperCase());
}

export function formatTime(iso: string): string {
  // "18:30"
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/**
 * Key used to group classes by day.
 * Uses a YYYY-MM-DD representation in the Buenos Aires timezone so that
 * classes at 23:00 local time don't jump into the next day.
 */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value ?? '';
  const m = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${y}-${m}-${day}`;
}
