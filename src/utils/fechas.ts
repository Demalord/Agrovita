/** Fechas como cadenas ISO locales "YYYY-MM-DD" para evitar problemas de zona horaria. */

export function aISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function desdeISO(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function hoyISO(): string {
  return aISO(new Date());
}

export function sumarDias(iso: string, dias: number): string {
  const f = desdeISO(iso);
  f.setDate(f.getDate() + dias);
  return aISO(f);
}

/** Días calendario entre dos fechas (b - a). */
export function diasEntre(a: string, b: string): number {
  const ms = desdeISO(b).getTime() - desdeISO(a).getTime();
  return Math.round(ms / 86_400_000);
}

const fmtCorta = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtLarga = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

export function fechaCorta(iso: string): string {
  return fmtCorta.format(desdeISO(iso));
}

export function fechaLarga(iso: string): string {
  return fmtLarga.format(desdeISO(iso));
}
