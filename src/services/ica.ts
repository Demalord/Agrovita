import registros from '../data/registros-ica.json';
import type { RegistroIca, ResultadoIca } from '../types';
import { hoyISO } from '../utils/fechas';
import { esperar } from './latencia';

const lista = registros as RegistroIca[];

export function normalizarNumero(numero: string): string {
  return numero.trim().toUpperCase();
}

/** Consulta síncrona contra la lista local (simula la base del ICA). */
export function consultarRegistro(numero: string, hoy = hoyISO()): ResultadoIca {
  const n = normalizarNumero(numero);
  const reg = lista.find((r) => r.numero === n);
  if (!reg) return { numero: n, estado: 'no-existe' };
  return { numero: n, estado: reg.vence >= hoy ? 'vigente' : 'vencido', titular: reg.titular, vence: reg.vence };
}

/** icaService.verificar(numero): versión asíncrona con latencia simulada. */
export async function verificar(numero: string): Promise<ResultadoIca> {
  await esperar(700);
  return consultarRegistro(numero);
}

export const textoEstadoIca: Record<ResultadoIca['estado'], string> = {
  vigente: 'Vigente',
  vencido: 'Vencido',
  'no-existe': 'No existe',
};
