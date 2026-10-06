import type { MetodoPago } from '../types';
import { esperar } from './latencia';

export interface ResultadoPago {
  aprobado: boolean;
  referencia: string;
  metodo: MetodoPago;
}

function referencia(): string {
  return `REF-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * pagoService.pagar(metodo)
 * - Contra entrega: se aprueba de inmediato (se paga al recibir).
 * - PSE y billetera: la pasarela simulada aprueba después de 2 s.
 */
export async function pagar(metodo: MetodoPago): Promise<ResultadoPago> {
  await esperar(metodo === 'contra-entrega' ? 300 : 2000);
  return { aprobado: true, referencia: referencia(), metodo };
}

export const bancosPSE = ['Banco Agrario', 'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA', 'Banco Caja Social'];
