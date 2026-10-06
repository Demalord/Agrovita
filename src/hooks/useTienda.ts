import { useMemo } from 'react';
import { productosPublicados, useCatalogo } from '../store/catalogo';
import { useCarrito } from '../store/carrito';
import { useSesion } from '../store/sesion';
import { cotizar, type LineaEnvio } from '../services/envio';

export function usePublicados() {
  const productos = useCatalogo((s) => s.productos);
  const vendedores = useCatalogo((s) => s.vendedores);
  return useMemo(() => productosPublicados(productos, vendedores), [productos, vendedores]);
}

export function useVendedores() {
  return useCatalogo((s) => s.vendedores);
}

export function useNombreVendedor() {
  const vendedores = useVendedores();
  return (id: string) => vendedores.find((v) => v.id === id)?.razonSocial ?? 'Vendedor';
}

/** Líneas del carrito con su producto (descarta productos que ya no existan). */
export function useLineasCarrito(): LineaEnvio[] {
  const items = useCarrito((s) => s.items);
  const productos = useCatalogo((s) => s.productos);
  return useMemo(
    () =>
      items
        .map((i) => ({ producto: productos.find((p) => p.id === i.productoId), cantidad: i.cantidad }))
        .filter((l): l is LineaEnvio => Boolean(l.producto)),
    [items, productos],
  );
}

/** Subtotal, envío y total puesto en finca del carrito (RN-05). */
export function useResumenCarrito(municipioIdForzado?: string) {
  const lineas = useLineasCarrito();
  const municipioSesion = useSesion((s) => s.ubicacion.municipioId);
  const municipioId = municipioIdForzado ?? municipioSesion;
  return useMemo(() => {
    const subtotal = lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0);
    const envio = cotizar(municipioId, lineas);
    return {
      lineas,
      subtotal,
      envio,
      total: subtotal + envio.total,
      unidades: lineas.reduce((s, l) => s + l.cantidad, 0),
      requiereFormula: lineas.some((l) => l.producto.requiereFormula),
      requiereFrio: lineas.some((l) => l.producto.requiereFrio),
    };
  }, [lineas, municipioId]);
}
