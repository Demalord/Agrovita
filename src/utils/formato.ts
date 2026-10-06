const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** Formatea un valor en pesos colombianos: 96000 → "$ 96.000" */
export function formatoCOP(valor: number): string {
  return cop.format(valor).replace(/ /g, ' ');
}

export const nombresCategoria: Record<string, string> = {
  concentrados: 'Concentrados',
  sales: 'Sales mineralizadas',
  equipos: 'Equipos',
  medicamentos: 'Medicamentos',
  biologicos: 'Vacunas',
};

export const nombresEspecie: Record<string, string> = {
  bovino: 'Bovino',
  porcino: 'Porcino',
  aves: 'Aves',
  equino: 'Equino',
  mascotas: 'Mascotas',
};

export const nombresEstadoPedido: Record<string, string> = {
  recibido: 'Recibido',
  despachado: 'Despachado',
  'en-camino': 'En camino',
  entregado: 'Entregado',
  'retracto-solicitado': 'Retracto solicitado',
};

export const nombresMetodoPago: Record<string, string> = {
  'contra-entrega': 'Contra entrega',
  pse: 'PSE',
  billetera: 'Billetera digital (Nequi / Daviplata)',
};
