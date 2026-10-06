import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EstadoPedido, Formula, Pedido } from '../types';
import { hoyISO, sumarDias } from '../utils/fechas';

/** Pedidos de ejemplo con fechas relativas a hoy para que el retracto se pueda demostrar. */
function pedidosIniciales(): Pedido[] {
  const hoy = hoyISO();
  const entregaFinca = {
    nombre: 'Carlos Rojas',
    telefono: '300 000 0000',
    departamento: 'Cundinamarca',
    municipioId: 'ubate',
    vereda: 'El Volcán',
    finca: 'La Esperanza',
    indicaciones: 'Después del puente, portón azul.',
  };
  return [
    {
      id: 'AGX-000118',
      compradorId: 'u1',
      items: [{ productoId: 'p07', vendedorId: 'v1', nombre: 'Sal mineralizada 8 % fósforo', presentacion: 'Bulto 40 kg', cantidad: 2, precio: 112000 }],
      entrega: entregaFinca,
      subtotal: 224000,
      envio: 24000,
      total: 248000,
      metodoPago: 'pse',
      estado: 'en-camino',
      fechaCreacion: sumarDias(hoy, -2),
    },
    {
      id: 'AGX-000105',
      compradorId: 'u1',
      items: [{ productoId: 'p02', vendedorId: 'v1', nombre: 'Concentrado levante terneras', presentacion: 'Bulto 40 kg', cantidad: 3, precio: 89000 }],
      entrega: entregaFinca,
      subtotal: 267000,
      envio: 30000,
      total: 297000,
      metodoPago: 'contra-entrega',
      estado: 'entregado',
      fechaCreacion: sumarDias(hoy, -4),
      fechaEntrega: sumarDias(hoy, -1),
    },
    {
      id: 'AGX-000097',
      compradorId: 'u1',
      items: [{ productoId: 'p11', vendedorId: 'v1', nombre: 'Bebedero plástico', presentacion: 'Tanque 500 L', cantidad: 1, precio: 385000 }],
      entrega: entregaFinca,
      subtotal: 385000,
      envio: 14700,
      total: 399700,
      metodoPago: 'billetera',
      estado: 'entregado',
      fechaCreacion: sumarDias(hoy, -35),
      fechaEntrega: sumarDias(hoy, -32),
    },
    {
      id: 'AGX-000121',
      compradorId: 'u9',
      items: [{ productoId: 'p14', vendedorId: 'v3', nombre: 'Antibiótico inyectable bovino', presentacion: 'Frasco 100 ml', cantidad: 2, precio: 68000 }],
      entrega: { ...entregaFinca, nombre: 'María Gómez', municipioId: 'chiquinquira', vereda: 'Varela', finca: 'El Recreo', indicaciones: '' },
      subtotal: 136000,
      envio: 16400,
      total: 152400,
      metodoPago: 'contra-entrega',
      formula: { archivo: 'formula-maria.pdf', fechaExpedicion: sumarDias(hoy, -12), veterinario: 'Dr. Luis Pardo', tarjetaProfesional: 'TP-12345', estado: 'por-validar' },
      estado: 'recibido',
      fechaCreacion: sumarDias(hoy, -1),
    },
  ];
}

interface PedidosState {
  pedidos: Pedido[];
  consecutivo: number;
  crear: (p: Omit<Pedido, 'id'>) => Pedido;
  cambiarEstado: (id: string, estado: EstadoPedido) => void;
  solicitarRetracto: (id: string) => void;
  setEstadoFormula: (id: string, estado: Formula['estado']) => void;
}

export const usePedidos = create<PedidosState>()(
  persist(
    (set, get) => ({
      pedidos: pedidosIniciales(),
      consecutivo: 123,
      crear: (datos) => {
        const n = get().consecutivo;
        const pedido: Pedido = { ...datos, id: `AGX-${String(n).padStart(6, '0')}` };
        set((s) => ({ pedidos: [pedido, ...s.pedidos], consecutivo: n + 1 }));
        return pedido;
      },
      cambiarEstado: (id, estado) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) =>
            p.id === id ? { ...p, estado, fechaEntrega: estado === 'entregado' ? (p.fechaEntrega ?? hoyISO()) : p.fechaEntrega } : p,
          ),
        })),
      solicitarRetracto: (id) =>
        set((s) => ({ pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, estado: 'retracto-solicitado', fechaRetracto: hoyISO() } : p)) })),
      setEstadoFormula: (id, estado) =>
        set((s) => ({ pedidos: s.pedidos.map((p) => (p.id === id && p.formula ? { ...p, formula: { ...p.formula, estado } } : p)) })),
    }),
    { name: 'agrovita-pedidos', version: 1 },
  ),
);
