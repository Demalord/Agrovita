import festivosData from '../data/festivos.json';
import { aISO, desdeISO, hoyISO, sumarDias } from '../utils/fechas';

/** Ley 1480 de 2011: 5 días hábiles desde la entrega (RN-06). */
export const DIAS_RETRACTO = 5;

const festivos = new Set<string>(festivosData as string[]);

export function esDiaHabil(iso: string): boolean {
  const dia = desdeISO(iso).getDay(); // 0 domingo, 6 sábado
  return dia !== 0 && dia !== 6 && !festivos.has(iso);
}

/** Días hábiles transcurridos después de `desde` hasta `hasta` (inclusive). */
export function diasHabilesTranscurridos(desde: string, hasta: string): number {
  let cuenta = 0;
  let actual = sumarDias(desde, 1);
  while (actual <= hasta) {
    if (esDiaHabil(actual)) cuenta++;
    actual = sumarDias(actual, 1);
  }
  return cuenta;
}

/** retractoService.diasHabilesRestantes(fechaEntrega) */
export function diasHabilesRestantes(fechaEntrega: string, hoy = hoyISO()): number {
  return Math.max(0, DIAS_RETRACTO - diasHabilesTranscurridos(fechaEntrega, hoy));
}

/** Último día hábil en el que se puede solicitar el retracto. */
export function fechaLimite(fechaEntrega: string): string {
  let cuenta = 0;
  let actual = fechaEntrega;
  while (cuenta < DIAS_RETRACTO) {
    actual = sumarDias(actual, 1);
    if (esDiaHabil(actual)) cuenta++;
  }
  return actual;
}

/** Suma n días hábiles a una fecha (para la fecha estimada de entrega). */
export function sumarDiasHabiles(iso: string, n: number): string {
  let actual = iso;
  let cuenta = 0;
  while (cuenta < n) {
    actual = sumarDias(actual, 1);
    if (esDiaHabil(actual)) cuenta++;
  }
  return actual;
}

export { aISO };
