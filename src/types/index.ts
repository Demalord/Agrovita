export type Categoria = 'concentrados' | 'sales' | 'equipos' | 'medicamentos' | 'biologicos';
export type Especie = 'bovino' | 'porcino' | 'aves' | 'equino' | 'mascotas';
export type EstadoAprobacion = 'pendiente' | 'aprobado' | 'rechazado';
export type Rol = 'comprador' | 'vendedor' | 'admin';
export type MetodoPago = 'contra-entrega' | 'pse' | 'billetera';
export type EstadoPedido = 'recibido' | 'despachado' | 'en-camino' | 'entregado' | 'retracto-solicitado';

export interface Vendedor {
  id: string;
  razonSocial: string;
  nit: string;
  municipio: string;
  registroIca: string; // RN-01
  estado: EstadoAprobacion;
  calificacion: number;
  motivoRechazo?: string;
}

export interface Producto {
  id: string;
  vendedorId: string;
  nombre: string;
  categoria: Categoria;
  especies: Especie[];
  presentacion: string;
  precio: number; // COP
  stock: number;
  pesoKg: number;
  registroIca: string; // RN-02
  requiereFormula: boolean; // RN-03
  requiereFrio: boolean; // RN-04
  imagenes: string[];
  descripcion: string;
  composicion: string;
  modoUso: string;
  estado: EstadoAprobacion;
  motivoRechazo?: string;
}

export interface RegistroIca {
  numero: string;
  tipo: 'producto' | 'establecimiento';
  titular: string;
  vence: string; // ISO yyyy-mm-dd
}

export type EstadoRegistro = 'vigente' | 'vencido' | 'no-existe';

export interface ResultadoIca {
  numero: string;
  estado: EstadoRegistro;
  titular?: string;
  vence?: string;
}

export interface Municipio {
  id: string;
  nombre: string;
  departamento: string;
  tarifaBase: number;
  tarifaKg: number;
  diasEntrega: number;
}

export interface Formula {
  archivo: string;
  fechaExpedicion: string; // ISO; válida si <= 30 días (RN-03)
  veterinario: string;
  tarjetaProfesional: string;
  estado: 'por-validar' | 'valida' | 'rechazada';
}

export interface Entrega {
  nombre: string;
  telefono: string;
  departamento: string;
  municipioId: string;
  vereda: string;
  finca: string;
  indicaciones: string;
}

export interface ItemPedido {
  productoId: string;
  vendedorId: string;
  nombre: string;
  presentacion: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: string;
  compradorId: string;
  items: ItemPedido[];
  entrega: Entrega;
  subtotal: number;
  envio: number;
  total: number; // RN-05
  metodoPago: MetodoPago; // RN-07
  formula?: Formula;
  estado: EstadoPedido;
  fechaCreacion: string;
  fechaEntrega?: string; // inicia el conteo de retracto (RN-06)
  fechaRetracto?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  vendedorId?: string;
  detalle: string;
}

export interface ItemCarrito {
  productoId: string;
  cantidad: number;
}

export interface Ubicacion {
  municipioId: string;
  vereda: string;
  finca: string;
}
