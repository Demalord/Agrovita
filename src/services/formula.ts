import { diasEntre, hoyISO } from '../utils/fechas';

/** Vigencia máxima de la fórmula veterinaria (RN-03). */
export const VIGENCIA_FORMULA_DIAS = 30;

export interface ValidacionFormula {
  valida: boolean;
  diasDesdeExpedicion: number;
  diasRestantes: number;
  mensaje: string;
}

export function validarFechaFormula(fechaExpedicion: string, hoy = hoyISO()): ValidacionFormula {
  if (!fechaExpedicion) {
    return { valida: false, diasDesdeExpedicion: 0, diasRestantes: 0, mensaje: 'Indica la fecha de expedición de la fórmula.' };
  }
  const dias = diasEntre(fechaExpedicion, hoy);
  if (dias < 0) {
    return { valida: false, diasDesdeExpedicion: dias, diasRestantes: 0, mensaje: 'La fecha de expedición no puede ser futura.' };
  }
  if (dias > VIGENCIA_FORMULA_DIAS) {
    return {
      valida: false,
      diasDesdeExpedicion: dias,
      diasRestantes: 0,
      mensaje: `Esta fórmula tiene ${dias} días. Solo se aceptan fórmulas de ${VIGENCIA_FORMULA_DIAS} días o menos: pide una nueva a tu veterinario o quita el producto del carrito.`,
    };
  }
  const restantes = VIGENCIA_FORMULA_DIAS - dias;
  return {
    valida: true,
    diasDesdeExpedicion: dias,
    diasRestantes: restantes,
    mensaje: restantes === 0 ? 'Fórmula vigente: hoy es su último día de validez.' : `Fórmula vigente: le quedan ${restantes} días de validez.`,
  };
}
