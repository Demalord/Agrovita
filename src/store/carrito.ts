import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemCarrito } from '../types';

interface CarritoState {
  items: ItemCarrito[];
  agregar: (productoId: string, cantidad?: number) => void;
  setCantidad: (productoId: string, cantidad: number) => void;
  quitar: (productoId: string) => void;
  vaciar: () => void;
}

export const useCarrito = create<CarritoState>()(
  persist(
    (set) => ({
      items: [],
      agregar: (productoId, cantidad = 1) =>
        set((s) => {
          const existe = s.items.find((i) => i.productoId === productoId);
          return {
            items: existe
              ? s.items.map((i) => (i.productoId === productoId ? { ...i, cantidad: i.cantidad + cantidad } : i))
              : [...s.items, { productoId, cantidad }],
          };
        }),
      setCantidad: (productoId, cantidad) =>
        set((s) => ({
          items: cantidad <= 0 ? s.items.filter((i) => i.productoId !== productoId) : s.items.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i)),
        })),
      quitar: (productoId) => set((s) => ({ items: s.items.filter((i) => i.productoId !== productoId) })),
      vaciar: () => set({ items: [] }),
    }),
    { name: 'agrovita-carrito', version: 1 },
  ),
);

export const contarUnidades = (items: ItemCarrito[]) => items.reduce((s, i) => s + i.cantidad, 0);
