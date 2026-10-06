import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import usuariosData from '../data/usuarios.json';
import type { Ubicacion, Usuario } from '../types';

export const usuariosPrueba = usuariosData as Usuario[];

interface SesionState {
  usuario: Usuario | null;
  ubicacion: Ubicacion;
  ingresar: (id: string) => void;
  salir: () => void;
  setUbicacion: (u: Ubicacion) => void;
}

export const useSesion = create<SesionState>()(
  persist(
    (set) => ({
      usuario: null,
      ubicacion: { municipioId: 'ubate', vereda: 'El Volcán', finca: 'La Esperanza' },
      ingresar: (id) => set({ usuario: usuariosPrueba.find((u) => u.id === id) ?? null }),
      salir: () => set({ usuario: null }),
      setUbicacion: (ubicacion) => set({ ubicacion }),
    }),
    { name: 'agrovita-sesion', version: 1 },
  ),
);
