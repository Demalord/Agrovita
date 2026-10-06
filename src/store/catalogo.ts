import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import productosData from '../data/productos.json';
import vendedoresData from '../data/vendedores.json';
import type { EstadoAprobacion, Producto, Vendedor } from '../types';

interface CatalogoState {
  productos: Producto[];
  vendedores: Vendedor[];
  agregarProducto: (p: Producto) => void;
  actualizarProducto: (id: string, cambios: Partial<Producto>) => void;
  setEstadoProducto: (id: string, estado: EstadoAprobacion, motivo?: string) => void;
  agregarVendedor: (v: Vendedor) => void;
  setEstadoVendedor: (id: string, estado: EstadoAprobacion, motivo?: string) => void;
  descontarStock: (lineas: { productoId: string; cantidad: number }[]) => void;
}

export const useCatalogo = create<CatalogoState>()(
  persist(
    (set) => ({
      productos: productosData as Producto[],
      vendedores: vendedoresData as Vendedor[],
      agregarProducto: (p) => set((s) => ({ productos: [...s.productos, p] })),
      actualizarProducto: (id, cambios) =>
        set((s) => ({ productos: s.productos.map((p) => (p.id === id ? { ...p, ...cambios } : p)) })),
      setEstadoProducto: (id, estado, motivo) =>
        set((s) => ({ productos: s.productos.map((p) => (p.id === id ? { ...p, estado, motivoRechazo: motivo } : p)) })),
      agregarVendedor: (v) => set((s) => ({ vendedores: [...s.vendedores, v] })),
      setEstadoVendedor: (id, estado, motivo) =>
        set((s) => ({ vendedores: s.vendedores.map((v) => (v.id === id ? { ...v, estado, motivoRechazo: motivo } : v)) })),
      descontarStock: (lineas) =>
        set((s) => ({
          productos: s.productos.map((p) => {
            const l = lineas.find((x) => x.productoId === p.id);
            return l ? { ...p, stock: Math.max(0, p.stock - l.cantidad) } : p;
          }),
        })),
    }),
    { name: 'agrovita-catalogo', version: 1 },
  ),
);

/** Solo se muestran en la tienda productos aprobados de vendedores aprobados (RN-01, RN-02). */
export function productosPublicados(productos: Producto[], vendedores: Vendedor[]): Producto[] {
  const aprobados = new Set(vendedores.filter((v) => v.estado === 'aprobado').map((v) => v.id));
  return productos.filter((p) => p.estado === 'aprobado' && aprobados.has(p.vendedorId));
}
