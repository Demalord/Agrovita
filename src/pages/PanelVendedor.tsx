import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alerta } from '../components/ui/Alerta';
import { Boton } from '../components/ui/Boton';
import { Chip, ChipIca } from '../components/ui/Chip';
import { IconoCarrito, IconoGrafico, IconoMas, IconoPaquete, IconoSalir } from '../components/ui/Iconos';
import { buscarMunicipio } from '../services/envio';
import { textoEstadoIca, verificar } from '../services/ica';
import { useCatalogo } from '../store/catalogo';
import { usePedidos } from '../store/pedidos';
import { useSesion } from '../store/sesion';
import type { Categoria, Especie, EstadoAprobacion, EstadoPedido, Producto } from '../types';
import { fechaCorta } from '../utils/fechas';
import { formatoCOP, nombresCategoria, nombresEspecie, nombresEstadoPedido, nombresMetodoPago } from '../utils/formato';

type Vista = 'resumen' | 'productos' | 'formulario' | 'pedidos';

const esquemaProducto = z.object({
  nombre: z.string().trim().min(3, 'Escribe el nombre del producto.'),
  categoria: z.enum(['concentrados', 'sales', 'equipos', 'medicamentos', 'biologicos']),
  especie: z.enum(['bovino', 'porcino', 'aves', 'equino', 'mascotas']),
  presentacion: z.string().trim().min(2, 'Escribe la presentación, por ejemplo “Bulto 40 kg”.'),
  precio: z.coerce.number<number>().int().min(1000, 'El precio mínimo es $ 1.000.'),
  stock: z.coerce.number<number>().int().min(0, 'El stock no puede ser negativo.'),
  pesoKg: z.coerce.number<number>().min(0.1, 'Indica el peso para calcular el envío.'),
  registroIca: z.string().trim().min(5, 'El número de registro ICA es obligatorio.'),
  requiereFormula: z.boolean(),
  requiereFrio: z.boolean(),
  descripcion: z.string().trim().min(10, 'Describe el producto en al menos 10 caracteres.'),
});
type DatosProducto = z.infer<typeof esquemaProducto>;

function chipAprobacion(estado: EstadoAprobacion, motivo?: string) {
  if (estado === 'aprobado') return <Chip tono="exito">Aprobado</Chip>;
  if (estado === 'pendiente') return <Chip tono="aviso">Pendiente</Chip>;
  return <Chip tono="error">{motivo ? `Rechazado · ${motivo}` : 'Rechazado'}</Chip>;
}

function FormularioProducto({ producto, vendedorId, onListo }: { producto?: Producto; vendedorId: string; onListo: (msg: string) => void }) {
  const agregarProducto = useCatalogo((s) => s.agregarProducto);
  const actualizarProducto = useCatalogo((s) => s.actualizarProducto);
  const [errorIca, setErrorIca] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<DatosProducto>({
    resolver: zodResolver(esquemaProducto),
    defaultValues: producto
      ? { ...producto, especie: producto.especies[0] }
      : { categoria: 'concentrados', especie: 'bovino', requiereFormula: false, requiereFrio: false, registroIca: '' },
  });
  const e = formState.errors;

  async function guardar(d: DatosProducto) {
    setErrorIca(null);
    const r = await verificar(d.registroIca);
    if (r.estado !== 'vigente') {
      setErrorIca(`El registro ${r.numero} ${r.estado === 'no-existe' ? 'no existe' : `está ${textoEstadoIca[r.estado].toLowerCase()}`}. El producto no se puede publicar.`);
      return;
    }
    const datos = {
      nombre: d.nombre,
      categoria: d.categoria as Categoria,
      especies: [d.especie as Especie],
      presentacion: d.presentacion,
      precio: d.precio,
      stock: d.stock,
      pesoKg: d.pesoKg,
      registroIca: r.numero,
      requiereFormula: d.requiereFormula,
      requiereFrio: d.requiereFrio,
      descripcion: d.descripcion,
    };
    if (producto) {
      // Cambiar el registro o las condiciones especiales obliga a una nueva revisión.
      const requiereRevision = producto.registroIca !== r.numero || producto.requiereFormula !== d.requiereFormula || producto.requiereFrio !== d.requiereFrio;
      actualizarProducto(producto.id, { ...datos, estado: requiereRevision ? 'pendiente' : producto.estado });
      onListo(requiereRevision ? 'Cambios guardados. El producto vuelve a revisión.' : 'Cambios guardados.');
    } else {
      agregarProducto({
        ...datos,
        id: `n${Date.now().toString(36)}`,
        vendedorId,
        imagenes: ['/img/productos/nuevo.svg'],
        composicion: 'Ver etiqueta del producto.',
        modoUso: 'Ver etiqueta del producto.',
        estado: 'pendiente',
      });
      onListo('Producto enviado a revisión. Aparecerá en la tienda cuando el administrador lo apruebe.');
    }
  }

  return (
    <form className="tarjeta flex flex-col gap-5 p-6" noValidate onSubmit={handleSubmit(guardar)}>
      <h2 className="text-2xl">{producto ? 'Editar producto' : 'Nuevo producto'}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="etiqueta" htmlFor="pn">Nombre</label>
          <input id="pn" className="campo" {...register('nombre')} />
          {e.nombre && <p className="error-campo">{e.nombre.message}</p>}
        </div>
        <div>
          <label className="etiqueta" htmlFor="pc">Categoría</label>
          <select id="pc" className="campo" {...register('categoria')}>
            {Object.entries(nombresCategoria).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="etiqueta" htmlFor="pe">Especie</label>
          <select id="pe" className="campo" {...register('especie')}>
            {Object.entries(nombresEspecie).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="etiqueta" htmlFor="pp">Presentación</label>
          <input id="pp" className="campo" placeholder="Bulto 40 kg" {...register('presentacion')} />
          {e.presentacion && <p className="error-campo">{e.presentacion.message}</p>}
        </div>
        <div>
          <label className="etiqueta" htmlFor="ppr">Precio (COP)</label>
          <input id="ppr" inputMode="numeric" className="campo" {...register('precio')} />
          {e.precio && <p className="error-campo">{e.precio.message}</p>}
        </div>
        <div>
          <label className="etiqueta" htmlFor="ps">Stock</label>
          <input id="ps" inputMode="numeric" className="campo" {...register('stock')} />
          {e.stock && <p className="error-campo">{e.stock.message}</p>}
        </div>
        <div>
          <label className="etiqueta" htmlFor="pk">Peso (kg) para el envío</label>
          <input id="pk" inputMode="decimal" className="campo" {...register('pesoKg')} />
          {e.pesoKg && <p className="error-campo">{e.pesoKg.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="etiqueta" htmlFor="pica">Número de registro ICA *</label>
          <input id="pica" className="campo max-w-sm font-mono" placeholder="ICA-DEMO-0021" {...register('registroIca')} aria-invalid={!!e.registroIca || !!errorIca} />
          {e.registroIca && <p className="error-campo">{e.registroIca.message}</p>}
          <p className="mt-1 text-sm text-texto-suave">Se verifica al guardar. Para probar: <code>ICA-DEMO-0021</code> está libre y vigente; <code>ICA-DEMO-0019</code> está vencido.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2 rounded-lg bg-[#fbfaf6] p-4">
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input type="checkbox" className="size-5 accent-formula" {...register('requiereFormula')} /> Requiere fórmula veterinaria
        </label>
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input type="checkbox" className="size-5 accent-frio" {...register('requiereFrio')} /> Requiere cadena de frío
        </label>
      </div>
      <div>
        <label className="etiqueta" htmlFor="pd">Descripción</label>
        <textarea id="pd" rows={3} className="campo py-3" {...register('descripcion')} />
        {e.descripcion && <p className="error-campo">{e.descripcion.message}</p>}
      </div>
      {errorIca && <Alerta tipo="error" titulo="Registro ICA no válido">{errorIca}</Alerta>}
      <div className="flex flex-wrap gap-3">
        <Boton type="submit" cargando={formState.isSubmitting}>{producto ? 'Guardar cambios' : 'Guardar y enviar a revisión'}</Boton>
        <Boton variante="secundario" onClick={() => onListo('')}>Cancelar</Boton>
      </div>
    </form>
  );
}

export default function PanelVendedor() {
  const usuario = useSesion((s) => s.usuario);
  const salir = useSesion((s) => s.salir);
  const vendedorId = usuario?.vendedorId ?? '';
  const vendedor = useCatalogo((s) => s.vendedores.find((v) => v.id === vendedorId));
  const todos = useCatalogo((s) => s.productos);
  const productos = useMemo(() => todos.filter((p) => p.vendedorId === vendedorId), [todos, vendedorId]);
  const todosPedidos = usePedidos((s) => s.pedidos);
  const cambiarEstado = usePedidos((s) => s.cambiarEstado);
  const pedidos = useMemo(() => todosPedidos.filter((p) => p.items.some((i) => i.vendedorId === vendedorId)), [todosPedidos, vendedorId]);
  const [vista, setVista] = useState<Vista>('productos');
  const [editando, setEditando] = useState<Producto | undefined>();
  const [mensaje, setMensaje] = useState('');

  const ventasMes = pedidos
    .filter((p) => p.estado !== 'retracto-solicitado')
    .reduce((s, p) => s + p.items.filter((i) => i.vendedorId === vendedorId).reduce((a, i) => a + i.precio * i.cantidad, 0), 0);

  const menu: { id: Vista; label: string; icono: React.ReactNode }[] = [
    { id: 'resumen', label: 'Resumen', icono: <IconoGrafico size={18} /> },
    { id: 'productos', label: 'Productos', icono: <IconoPaquete size={18} /> },
    { id: 'pedidos', label: 'Pedidos', icono: <IconoCarrito size={18} /> },
  ];

  return (
    <div className="contenedor pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-texto-suave">Panel de vendedor</p>
          <h1 className="text-3xl">{vendedor?.razonSocial}</h1>
          <div className="mt-1 flex flex-wrap gap-2"><ChipIca texto={`Registro ${vendedor?.registroIca} · aprobado`} /></div>
        </div>
        <Boton variante="secundario" tamano="sm" onClick={salir}><IconoSalir size={18} /> Salir</Boton>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <nav aria-label="Secciones del panel" className="tarjeta flex gap-1 overflow-x-auto p-2 md:w-56 md:shrink-0 md:flex-col">
          {menu.map((m) => {
            const activo = vista === m.id || (m.id === 'productos' && vista === 'formulario');
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => { setVista(m.id); setMensaje(''); }}
                aria-current={activo ? 'page' : undefined}
                className={`flex min-h-12 items-center gap-3 whitespace-nowrap rounded-lg px-4 text-left font-semibold ${activo ? 'bg-primario text-white' : 'hover:bg-primario-suave'}`}
              >
                {m.icono} {m.label}
              </button>
            );
          })}
        </nav>

        <section className="min-w-0 flex-1">
          {mensaje && <div className="mb-4"><Alerta tipo="exito" rol="status">{mensaje}</Alerta></div>}

          {vista === 'resumen' && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Pedidos nuevos', pedidos.filter((p) => p.estado === 'recibido').length],
                ['Por despachar', pedidos.filter((p) => p.estado === 'recibido' || p.estado === 'despachado').length],
                ['Ventas registradas', formatoCOP(ventasMes)],
                ['Productos en revisión', productos.filter((p) => p.estado === 'pendiente').length],
              ].map(([t, v]) => (
                <div key={t} className="tarjeta p-5">
                  <p className="text-sm text-texto-suave">{t}</p>
                  <p className="mt-1 text-3xl font-bold">{v}</p>
                </div>
              ))}
            </div>
          )}

          {vista === 'productos' && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl">Mis productos</h2>
                <Boton onClick={() => { setEditando(undefined); setVista('formulario'); setMensaje(''); }}><IconoMas size={18} /> Nuevo producto</Boton>
              </div>
              <div className="tarjeta overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#fbfaf6]">
                    <tr className="border-b border-borde">
                      <th className="px-4 py-3 font-semibold">Producto</th>
                      <th className="px-4 py-3 font-semibold">Registro ICA</th>
                      <th className="px-4 py-3 font-semibold">Precio</th>
                      <th className="px-4 py-3 font-semibold">Stock</th>
                      <th className="px-4 py-3 font-semibold">Condiciones</th>
                      <th className="px-4 py-3 font-semibold">Aprobación</th>
                      <th className="px-4 py-3"><span className="sr-only">Acciones</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id} className="border-b border-borde last:border-b-0">
                        <td className="px-4 py-3"><strong>{p.nombre}</strong><br /><span className="text-texto-suave">{p.presentacion}</span></td>
                        <td className="px-4 py-3 font-mono text-xs">{p.registroIca}</td>
                        <td className="px-4 py-3">{formatoCOP(p.precio)}</td>
                        <td className="px-4 py-3">{p.stock}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.requiereFormula && <Chip tono="formula">Fórmula</Chip>}
                            {p.requiereFrio && <Chip tono="frio">Frío</Chip>}
                            {!p.requiereFormula && !p.requiereFrio && <span className="text-texto-suave">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">{chipAprobacion(p.estado, p.motivoRechazo)}</td>
                        <td className="px-4 py-3">
                          <Boton variante="secundario" tamano="sm" onClick={() => { setEditando(p); setVista('formulario'); setMensaje(''); }}>Editar</Boton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {vista === 'formulario' && (
            <FormularioProducto
              key={editando?.id ?? 'nuevo'}
              producto={editando}
              vendedorId={vendedorId}
              onListo={(msg) => { setMensaje(msg); setVista('productos'); }}
            />
          )}

          {vista === 'pedidos' && (
            <>
              <h2 className="mb-4 text-2xl">Pedidos</h2>
              <div className="tarjeta overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#fbfaf6]">
                    <tr className="border-b border-borde">
                      <th className="px-4 py-3 font-semibold">Pedido</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Destino</th>
                      <th className="px-4 py-3 font-semibold">Mis productos</th>
                      <th className="px-4 py-3 font-semibold">Pago</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id} className="border-b border-borde last:border-b-0">
                        <td className="px-4 py-3 font-semibold">{p.id}</td>
                        <td className="px-4 py-3">{fechaCorta(p.fechaCreacion)}</td>
                        <td className="px-4 py-3">{buscarMunicipio(p.entrega.municipioId)?.nombre} · Vda. {p.entrega.vereda}</td>
                        <td className="px-4 py-3">
                          {p.items.filter((i) => i.vendedorId === vendedorId).map((i) => <div key={i.productoId}>{i.cantidad} × {i.nombre}</div>)}
                          {p.formula && <div className="text-formula">Fórmula: {p.formula.estado.replace('-', ' ')}</div>}
                        </td>
                        <td className="px-4 py-3">{nombresMetodoPago[p.metodoPago].split(' (')[0]}</td>
                        <td className="px-4 py-3">
                          {p.estado === 'retracto-solicitado' ? (
                            <Chip tono="aviso">Retracto solicitado</Chip>
                          ) : (
                            <>
                              <label htmlFor={`est-${p.id}`} className="sr-only">Estado de {p.id}</label>
                              <select id={`est-${p.id}`} className="campo min-w-40" value={p.estado} onChange={(e) => cambiarEstado(p.id, e.target.value as EstadoPedido)}>
                                {(['recibido', 'despachado', 'en-camino', 'entregado'] as EstadoPedido[]).map((s) => <option key={s} value={s}>{nombresEstadoPedido[s]}</option>)}
                              </select>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-texto-suave">Al marcar un pedido como “Entregado” empieza a contar el plazo de retracto del comprador.</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
