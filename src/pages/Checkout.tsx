import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Boton } from '../components/ui/Boton';
import { IconoBanco, IconoBillete, IconoCelular, IconoSubir } from '../components/ui/Iconos';
import { Modal } from '../components/ui/Modal';
import { Stepper } from '../components/ui/Stepper';
import { useResumenCarrito } from '../hooks/useTienda';
import { municipios, buscarMunicipio } from '../services/envio';
import { validarFechaFormula } from '../services/formula';
import { bancosPSE, pagar } from '../services/pago';
import { sumarDiasHabiles } from '../services/retracto';
import { useCarrito } from '../store/carrito';
import { useCatalogo } from '../store/catalogo';
import { usePedidos } from '../store/pedidos';
import { useSesion } from '../store/sesion';
import type { Entrega, Formula, MetodoPago } from '../types';
import { hoyISO } from '../utils/fechas';
import { formatoCOP, nombresMetodoPago } from '../utils/formato';
import { ResumenPedido } from './Carrito';

const esquemaEntrega = z.object({
  nombre: z.string().trim().min(3, 'Escribe el nombre de quien recibe.'),
  telefono: z.string().trim().regex(/^[0-9 ]{7,15}$/, 'Escribe un teléfono válido (solo números).'),
  departamento: z.string().min(1),
  municipioId: z.string().min(1, 'Elige un municipio.'),
  vereda: z.string().trim().min(2, 'Escribe la vereda.'),
  finca: z.string().trim().min(2, 'Escribe el nombre de la finca.'),
  indicaciones: z.string().trim().max(200, 'Máximo 200 caracteres.'),
});

const esquemaFormula = z
  .object({
    archivo: z.string().min(1, 'Sube la fórmula en imagen o PDF.'),
    fechaExpedicion: z.string().min(1, 'Indica la fecha de expedición.'),
    veterinario: z.string().trim().min(3, 'Escribe el nombre del médico veterinario.'),
    tarjetaProfesional: z.string().trim().min(3, 'Escribe la tarjeta profesional.'),
  })
  .superRefine((v, ctx) => {
    const r = validarFechaFormula(v.fechaExpedicion);
    if (v.fechaExpedicion && !r.valida) ctx.addIssue({ code: 'custom', path: ['fechaExpedicion'], message: r.mensaje });
  });

type DatosEntrega = z.infer<typeof esquemaEntrega>;
type DatosFormula = z.infer<typeof esquemaFormula>;

const metodos: { id: MetodoPago; titulo: string; nota: string; icono: React.ReactNode }[] = [
  { id: 'contra-entrega', titulo: 'Contra entrega', nota: 'Pagas en efectivo cuando el pedido llegue a la finca.', icono: <IconoBillete /> },
  { id: 'pse', titulo: 'PSE', nota: 'Débito desde tu cuenta bancaria. Te llevamos a la pasarela.', icono: <IconoBanco /> },
  { id: 'billetera', titulo: 'Billetera digital', nota: 'Nequi o Daviplata. Recibirás una notificación en tu celular.', icono: <IconoCelular /> },
];

export default function Checkout() {
  const resumen = useResumenCarrito();
  const usuario = useSesion((s) => s.usuario);
  const ubicacion = useSesion((s) => s.ubicacion);
  const setUbicacion = useSesion((s) => s.setUbicacion);
  const vaciar = useCarrito((s) => s.vaciar);
  const descontarStock = useCatalogo((s) => s.descontarStock);
  const crearPedido = usePedidos((s) => s.crear);
  const navigate = useNavigate();

  const pasos = resumen.requiereFormula ? ['Entrega', 'Fórmula', 'Pago', 'Revisión'] : ['Entrega', 'Pago', 'Revisión'];
  const [paso, setPaso] = useState(0);
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [formula, setFormula] = useState<Formula | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>('contra-entrega');
  const [banco, setBanco] = useState(bancosPSE[0]);
  const [billetera, setBilletera] = useState<'Nequi' | 'Daviplata'>('Nequi');
  const [pasarela, setPasarela] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const municipioInicial = buscarMunicipio(ubicacion.municipioId);
  const formEntrega = useForm<DatosEntrega>({
    resolver: zodResolver(esquemaEntrega),
    defaultValues: {
      nombre: usuario?.nombre ?? '',
      telefono: '300 000 0000',
      departamento: municipioInicial?.departamento ?? 'Cundinamarca',
      municipioId: ubicacion.municipioId,
      vereda: ubicacion.vereda,
      finca: ubicacion.finca,
      indicaciones: '',
    },
  });
  const formFormula = useForm<DatosFormula>({
    resolver: zodResolver(esquemaFormula),
    mode: 'onChange',
    defaultValues: { archivo: '', fechaExpedicion: '', veterinario: '', tarjetaProfesional: '' },
  });

  const municipioId = formEntrega.watch('municipioId');
  const departamento = formEntrega.watch('departamento');
  const fechaFormula = formFormula.watch('fechaExpedicion');
  const validacionFecha = fechaFormula ? validarFechaFormula(fechaFormula) : null;
  const resumenEntrega = useResumenCarrito(municipioId);

  if (resumen.lineas.length === 0 && !procesando) return <Navigate to="/carrito" replace />;

  const nombrePaso = pasos[paso];
  const irA = (nombre: string) => setPaso(pasos.indexOf(nombre));
  const siguiente = () => setPaso((p) => Math.min(pasos.length - 1, p + 1));
  const atras = () => setPaso((p) => Math.max(0, p - 1));

  async function confirmar() {
    if (!entrega || !usuario) return;
    if (metodo !== 'contra-entrega') setPasarela(true);
    setProcesando(true);
    const pago = await pagar(metodo);
    if (!pago.aprobado) {
      setProcesando(false);
      setPasarela(false);
      return;
    }
    const r = resumenEntrega;
    const pedido = crearPedido({
      compradorId: usuario.id,
      items: r.lineas.map(({ producto, cantidad }) => ({
        productoId: producto.id,
        vendedorId: producto.vendedorId,
        nombre: producto.nombre,
        presentacion: producto.presentacion,
        cantidad,
        precio: producto.precio,
      })),
      entrega,
      subtotal: r.subtotal,
      envio: r.envio.total,
      total: r.total,
      metodoPago: metodo,
      formula: formula ?? undefined,
      estado: 'recibido',
      fechaCreacion: hoyISO(),
    });
    descontarStock(r.lineas.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad })));
    navigate(`/pedido/${pedido.id}/confirmado`, { replace: true, state: { referencia: pago.referencia, entregaEstimada: sumarDiasHabiles(hoyISO(), r.envio.diasEntrega) } });
    vaciar();
  }

  const err = formEntrega.formState.errors;
  const errF = formFormula.formState.errors;

  return (
    <div className="contenedor pt-8">
      <Link to="/carrito" className="text-sm font-semibold text-primario-oscuro underline">← Volver al carrito</Link>
      <h1 className="mb-5 mt-3 text-3xl">Finalizar compra</h1>
      <div className="mb-8"><Stepper pasos={pasos} actual={paso} /></div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1">
          {nombrePaso === 'Entrega' && (
            <form
              className="tarjeta flex flex-col gap-4 p-6"
              noValidate
              onSubmit={formEntrega.handleSubmit((d) => {
                setEntrega(d);
                setUbicacion({ municipioId: d.municipioId, vereda: d.vereda, finca: d.finca });
                siguiente();
              })}
            >
              <h2 className="text-2xl">¿Dónde recibes el pedido?</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="etiqueta" htmlFor="nombre">Nombre de quien recibe</label>
                  <input id="nombre" className="campo" {...formEntrega.register('nombre')} aria-invalid={!!err.nombre} />
                  {err.nombre && <p className="error-campo">{err.nombre.message}</p>}
                </div>
                <div>
                  <label className="etiqueta" htmlFor="telefono">Teléfono</label>
                  <input id="telefono" inputMode="tel" className="campo" {...formEntrega.register('telefono')} aria-invalid={!!err.telefono} />
                  {err.telefono && <p className="error-campo">{err.telefono.message}</p>}
                </div>
                <div>
                  <label className="etiqueta" htmlFor="departamento">Departamento</label>
                  <select
                    id="departamento"
                    className="campo"
                    {...formEntrega.register('departamento', {
                      onChange: (e) => formEntrega.setValue('municipioId', municipios.find((m) => m.departamento === e.target.value)?.id ?? ''),
                    })}
                  >
                    {[...new Set(municipios.map((m) => m.departamento))].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="etiqueta" htmlFor="municipio">Municipio</label>
                  <select id="municipio" className="campo" {...formEntrega.register('municipioId')}>
                    {municipios.filter((m) => m.departamento === departamento).map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="etiqueta" htmlFor="vereda">Vereda</label>
                  <input id="vereda" className="campo" {...formEntrega.register('vereda')} aria-invalid={!!err.vereda} />
                  {err.vereda && <p className="error-campo">{err.vereda.message}</p>}
                </div>
                <div>
                  <label className="etiqueta" htmlFor="finca">Nombre de la finca</label>
                  <input id="finca" className="campo" {...formEntrega.register('finca')} aria-invalid={!!err.finca} />
                  {err.finca && <p className="error-campo">{err.finca.message}</p>}
                </div>
              </div>
              <div>
                <label className="etiqueta" htmlFor="indicaciones">Indicaciones para llegar <span className="font-normal text-texto-suave">(opcional)</span></label>
                <textarea id="indicaciones" rows={3} className="campo py-3" placeholder="Ej.: después del puente, portón azul." {...formEntrega.register('indicaciones')} />
                {err.indicaciones && <p className="error-campo">{err.indicaciones.message}</p>}
              </div>
              <p className="text-sm text-texto-suave">El costo de envío se recalcula al cambiar el municipio.</p>
              {resumen.requiereFrio && <Alerta tipo="frio">Tu pedido incluye productos con cadena de frío: se enviarán refrigerados.</Alerta>}
              <div className="flex justify-end"><Boton type="submit">Continuar</Boton></div>
            </form>
          )}

          {nombrePaso === 'Fórmula' && (
            <form
              className="tarjeta flex flex-col gap-4 p-6"
              noValidate
              onSubmit={formFormula.handleSubmit((d) => {
                setFormula({ ...d, estado: 'por-validar' });
                siguiente();
              })}
            >
              <h2 className="text-2xl">Sube la fórmula veterinaria</h2>
              <p className="text-texto-suave">
                Para: {resumen.lineas.filter((l) => l.producto.requiereFormula).map((l) => l.producto.nombre).join(', ')}. La fórmula debe tener 30 días o menos.
              </p>
              <div>
                <label htmlFor="archivo" className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[#b9b3a6] bg-[#fbfaf6] p-6 text-center hover:border-primario">
                  <IconoSubir className="text-primario" size={28} />
                  <span className="font-semibold">{formFormula.watch('archivo') || 'Elige la imagen o el PDF de la fórmula'}</span>
                  <span className="text-sm text-texto-suave">JPG, PNG o PDF · el archivo no sale de tu equipo en este prototipo</span>
                </label>
                <input
                  id="archivo"
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => formFormula.setValue('archivo', e.target.files?.[0]?.name ?? '', { shouldValidate: true })}
                />
                {errF.archivo && <p className="error-campo">{errF.archivo.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="etiqueta" htmlFor="fexp">Fecha de expedición</label>
                  <input id="fexp" type="date" max={hoyISO()} className="campo" {...formFormula.register('fechaExpedicion')} aria-invalid={!!errF.fechaExpedicion} />
                </div>
                <div>
                  <label className="etiqueta" htmlFor="vet">Médico veterinario</label>
                  <input id="vet" className="campo" {...formFormula.register('veterinario')} />
                  {errF.veterinario && <p className="error-campo">{errF.veterinario.message}</p>}
                </div>
                <div>
                  <label className="etiqueta" htmlFor="tp">Tarjeta profesional</label>
                  <input id="tp" className="campo" {...formFormula.register('tarjetaProfesional')} />
                  {errF.tarjetaProfesional && <p className="error-campo">{errF.tarjetaProfesional.message}</p>}
                </div>
              </div>
              <div aria-live="polite">
                {validacionFecha &&
                  (validacionFecha.valida ? (
                    <Alerta tipo="exito">{validacionFecha.mensaje}</Alerta>
                  ) : (
                    <Alerta tipo="error" titulo="No puedes continuar al pago">{validacionFecha.mensaje}</Alerta>
                  ))}
                {!validacionFecha && errF.fechaExpedicion && <p className="error-campo">{errF.fechaExpedicion.message}</p>}
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <Boton variante="secundario" onClick={atras}>Atrás</Boton>
                <Boton type="submit" disabled={!!validacionFecha && !validacionFecha.valida}>Continuar</Boton>
              </div>
            </form>
          )}

          {nombrePaso === 'Pago' && (
            <div className="tarjeta flex flex-col gap-4 p-6">
              <h2 className="text-2xl">¿Cómo quieres pagar?</h2>
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Medio de pago</legend>
                {metodos.map((m) => (
                  <label key={m.id} className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 ${metodo === m.id ? 'border-2 border-primario bg-primario-suave' : 'border-[#c9c3b5] hover:border-primario'}`}>
                    <input type="radio" name="metodo" value={m.id} checked={metodo === m.id} onChange={() => setMetodo(m.id)} className="mt-1 size-5 accent-primario" />
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-primario-oscuro">{m.icono}</span>
                    <span>
                      <span className="block font-semibold">{m.titulo}{m.id === 'contra-entrega' && <span className="ml-2 rounded-full bg-acento-suave px-2 py-0.5 text-xs text-[#7a5200]">El más usado en el campo</span>}</span>
                      <span className="text-sm text-texto-suave">{m.nota}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              {metodo === 'pse' && (
                <div className="max-w-sm">
                  <label className="etiqueta" htmlFor="banco">Banco</label>
                  <select id="banco" className="campo" value={banco} onChange={(e) => setBanco(e.target.value)}>
                    {bancosPSE.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              {metodo === 'billetera' && (
                <fieldset className="flex gap-3">
                  <legend className="etiqueta">Billetera</legend>
                  {(['Nequi', 'Daviplata'] as const).map((b) => (
                    <label key={b} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-4 ${billetera === b ? 'border-2 border-primario bg-primario-suave' : 'border-[#c9c3b5]'}`}>
                      <input type="radio" name="billetera" checked={billetera === b} onChange={() => setBilletera(b)} className="size-5 accent-primario" /> {b}
                    </label>
                  ))}
                </fieldset>
              )}
              <div className="flex flex-wrap justify-between gap-3">
                <Boton variante="secundario" onClick={atras}>Atrás</Boton>
                <Boton onClick={siguiente}>Continuar</Boton>
              </div>
            </div>
          )}

          {nombrePaso === 'Revisión' && entrega && (
            <div className="tarjeta flex flex-col gap-5 p-6">
              <h2 className="text-2xl">Revisa tu pedido</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-borde p-4">
                  <p className="font-semibold">Entrega</p>
                  <p className="text-sm text-texto-suave">
                    {entrega.nombre} · {entrega.telefono}<br />
                    Finca {entrega.finca}, Vda. {entrega.vereda}, {buscarMunicipio(entrega.municipioId)?.nombre} ({entrega.departamento})
                  </p>
                  <Boton variante="fantasma" tamano="sm" className="mt-2 -ml-3" onClick={() => irA('Entrega')}>Cambiar</Boton>
                </div>
                <div className="rounded-lg border border-borde p-4">
                  <p className="font-semibold">Pago</p>
                  <p className="text-sm text-texto-suave">
                    {nombresMetodoPago[metodo]}
                    {metodo === 'pse' && ` · ${banco}`}
                    {metodo === 'billetera' && ` · ${billetera}`}
                  </p>
                  <Boton variante="fantasma" tamano="sm" className="mt-2 -ml-3" onClick={() => irA('Pago')}>Cambiar</Boton>
                </div>
              </div>
              <ul className="flex flex-col gap-2 text-[15px]">
                {resumenEntrega.lineas.map(({ producto, cantidad }) => (
                  <li key={producto.id} className="flex justify-between gap-3">
                    <span>
                      {cantidad} × {producto.nombre} · {producto.presentacion}
                      {producto.requiereFormula && <span className="text-formula"> · fórmula adjunta</span>}
                      {producto.requiereFrio && <span className="text-frio"> · envío refrigerado</span>}
                    </span>
                    <span className="shrink-0 whitespace-nowrap tabular-nums">{formatoCOP(producto.precio * cantidad)}</span>
                  </li>
                ))}
              </ul>
              <Alerta tipo="info" titulo="Derecho de retracto">
                Tienes 5 días hábiles desde la entrega para devolver el pedido (Ley 1480 de 2011).{' '}
                <Link to="/info/retracto" className="font-semibold underline">Ver condiciones</Link>
              </Alerta>
              <div className="flex flex-wrap justify-between gap-3">
                <Boton variante="secundario" onClick={atras}>Atrás</Boton>
                <Boton onClick={confirmar} cargando={procesando}>
                  Confirmar pedido · {formatoCOP(resumenEntrega.total)}
                </Boton>
              </div>
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-40 lg:w-[360px]">
          <ResumenPedido municipioId={municipioId} />
        </aside>
      </div>

      <Modal abierto={pasarela} titulo={metodo === 'pse' ? `PSE · ${banco}` : billetera} onCerrar={() => undefined} cerrable={false}>
        <div className="flex flex-col items-center gap-4 py-4 text-center" role="status">
          <span className="size-12 animate-spin rounded-full border-4 border-primario border-t-transparent" aria-hidden="true" />
          <p className="text-lg font-semibold">Procesando pago de {formatoCOP(resumenEntrega.total)}</p>
          <p className="text-sm text-texto-suave">Pasarela simulada: no se hace ningún cobro real.</p>
        </div>
      </Modal>
    </div>
  );
}
