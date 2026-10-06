import municipiosData from '../data/municipios.json';
import type { Municipio, Producto } from '../types';

export const municipios = municipiosData as Municipio[];

/** Recargo fijo por grupo de vendedor cuando hay productos con cadena de frío (RN-04). */
export const RECARGO_FRIO = 25000;

export function buscarMunicipio(id: string): Municipio | undefined {
  return municipios.find((m) => m.id === id);
}

export interface LineaEnvio {
  producto: Producto;
  cantidad: number;
}

export interface CotizacionGrupo {
  vendedorId: string;
  pesoKg: number;
  base: number;
  recargoFrio: number;
  total: number;
  frio: boolean;
}

export interface Cotizacion {
  grupos: CotizacionGrupo[];
  total: number;
  diasEntrega: number;
}

function redondearCien(valor: number): number {
  return Math.round(valor / 100) * 100;
}

/** Envío de un grupo (un vendedor) a un municipio: tarifa base + tarifa por kg + recargo de frío. */
export function cotizarGrupo(municipio: Municipio, pesoKg: number, frio: boolean): Omit<CotizacionGrupo, 'vendedorId'> {
  const base = municipio.tarifaBase + redondearCien(pesoKg * municipio.tarifaKg);
  const recargoFrio = frio ? RECARGO_FRIO : 0;
  return { pesoKg, base, recargoFrio, total: base + recargoFrio, frio };
}

/** envioService.cotizar(municipio, items): agrupa por vendedor porque cada uno despacha por separado. */
export function cotizar(municipioId: string, lineas: LineaEnvio[]): Cotizacion {
  const municipio = buscarMunicipio(municipioId);
  if (!municipio || lineas.length === 0) return { grupos: [], total: 0, diasEntrega: 0 };

  const porVendedor = new Map<string, { peso: number; frio: boolean }>();
  for (const { producto, cantidad } of lineas) {
    const g = porVendedor.get(producto.vendedorId) ?? { peso: 0, frio: false };
    g.peso += producto.pesoKg * cantidad;
    g.frio = g.frio || producto.requiereFrio;
    porVendedor.set(producto.vendedorId, g);
  }

  const grupos = [...porVendedor.entries()].map(([vendedorId, g]) => ({
    vendedorId,
    ...cotizarGrupo(municipio, g.peso, g.frio),
  }));
  return {
    grupos,
    total: grupos.reduce((s, g) => s + g.total, 0),
    diasEntrega: municipio.diasEntrega,
  };
}

/** Estimado para la ficha de producto: envío si se compra solo este producto. */
export function estimarProducto(municipioId: string, producto: Producto, cantidad: number): number {
  return cotizar(municipioId, [{ producto, cantidad }]).total;
}
