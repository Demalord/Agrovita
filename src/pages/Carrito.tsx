import { asset } from '../utils/asset';
import { Link } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { BotonLink } from '../components/ui/Boton';
import { Cantidad } from '../components/ui/Cantidad';
import { ChipIca } from '../components/ui/Chip';
import { IconoBasura, IconoCarrito, IconoFrio, IconoReceta } from '../components/ui/Iconos';
import { useNombreVendedor, useResumenCarrito } from '../hooks/useTienda';
import { buscarMunicipio } from '../services/envio';
import { useCarrito } from '../store/carrito';
import { useSesion } from '../store/sesion';
import { formatoCOP } from '../utils/formato';

export function ResumenPedido({ children, municipioId }: { children?: React.ReactNode; municipioId?: string }) {
  const r = useResumenCarrito(municipioId);
  const nombreVendedor = useNombreVendedor();
  return (
    <div className="tarjeta flex flex-col gap-3 p-5">
      <h2 className="text-xl">Resumen del pedido</h2>
      <div className="flex justify-between gap-3"><span>Subtotal ({r.unidades} {r.unidades === 1 ? 'producto' : 'productos'})</span><span className="shrink-0 whitespace-nowrap tabular-nums">{formatoCOP(r.subtotal)}</span></div>
      {r.envio.grupos.map((g) => (
        <div key={g.vendedorId} className="flex justify-between gap-3 text-[15px]">
          <span>Envío {g.frio ? 'refrigerado ' : ''}{nombreVendedor(g.vendedorId)}</span>
          <span className="shrink-0 whitespace-nowrap tabular-nums">{formatoCOP(g.total)}</span>
        </div>
      ))}
      <div className="-mx-5 flex items-center justify-between gap-3 bg-acento-suave px-5 py-3">
        <span className="text-lg font-semibold">Total puesto en finca</span>
        <span className="whitespace-nowrap text-2xl font-bold">{formatoCOP(r.total)}</span>
      </div>
      {children}
    </div>
  );
}

export default function Carrito() {
  const { lineas, envio } = useResumenCarrito();
  const setCantidad = useCarrito((s) => s.setCantidad);
  const quitar = useCarrito((s) => s.quitar);
  const ubicacion = useSesion((s) => s.ubicacion);
  const nombreVendedor = useNombreVendedor();
  const municipio = buscarMunicipio(ubicacion.municipioId);

  if (lineas.length === 0) {
    return (
      <div className="contenedor pt-8">
        <h1 className="mb-6 text-3xl">Tu carrito</h1>
        <div className="tarjeta flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-primario-suave text-primario-oscuro"><IconoCarrito size={36} /></span>
          <h2 className="text-2xl">Tu carrito está vacío</h2>
          <p className="max-w-sm text-texto-suave">Agrega concentrados, sales o equipos para ver el precio puesto en tu finca.</p>
          <BotonLink to="/catalogo">Ver catálogo</BotonLink>
        </div>
      </div>
    );
  }

  const grupos = envio.grupos.map((g) => ({ ...g, lineas: lineas.filter((l) => l.producto.vendedorId === g.vendedorId) }));

  return (
    <div className="contenedor pt-8">
      <h1 className="mb-6 text-3xl">Tu carrito</h1>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <section className="flex min-w-0 flex-1 flex-col gap-6" aria-label="Productos">
          {grupos.map((g) => (
            <div key={g.vendedorId} className="tarjeta overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borde bg-[#fbfaf6] px-5 py-3">
                <p className="font-semibold">Vendido por {nombreVendedor(g.vendedorId)}</p>
                <ChipIca texto="Vendedor registrado ICA" />
              </div>
              <ul>
                {g.lineas.map(({ producto, cantidad }) => (
                  <li key={producto.id} className="flex flex-wrap items-center gap-4 border-b border-borde px-5 py-4 last:border-b-0">
                    <Link to={`/producto/${producto.id}`} className="size-20 shrink-0 overflow-hidden rounded-lg bg-[#f3f1ea]">
                      <img src={asset(producto.imagenes[0])} alt="" className="size-full object-cover" />
                    </Link>
                    <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                      <Link to={`/producto/${producto.id}`} className="font-semibold hover:underline">{producto.nombre}</Link>
                      <span className="text-sm text-texto-suave">{producto.presentacion} · {formatoCOP(producto.precio)} c/u</span>
                      {producto.requiereFormula && (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-formula-suave px-2 py-1 text-sm text-formula">
                          <IconoReceta size={16} /> Requiere fórmula veterinaria: la subirás en el pago.
                        </span>
                      )}
                      {producto.requiereFrio && (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-frio-suave px-2 py-1 text-sm text-frio">
                          <IconoFrio size={16} /> Envío refrigerado obligatorio (cadena de frío).
                        </span>
                      )}
                    </div>
                    <Cantidad valor={cantidad} onCambiar={(n) => setCantidad(producto.id, n)} max={producto.stock} etiqueta={`Cantidad de ${producto.nombre}`} />
                    <strong className="w-28 text-right text-lg">{formatoCOP(producto.precio * cantidad)}</strong>
                    <button type="button" onClick={() => quitar(producto.id)} className="grid size-11 place-items-center rounded-lg text-texto-suave hover:bg-formula-suave hover:text-formula" aria-label={`Eliminar ${producto.nombre}`}>
                      <IconoBasura />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between gap-3 border-t border-borde px-5 py-3 text-[15px]">
                <span className="text-texto-suave">{g.frio ? 'Envío refrigerado' : 'Envío estándar'} a tu finca · {g.pesoKg} kg</span>
                <strong>{formatoCOP(g.total)}</strong>
              </div>
            </div>
          ))}
          <Link to="/catalogo" className="font-semibold text-primario-oscuro underline">Seguir comprando</Link>
        </section>

        <aside className="lg:sticky lg:top-40 lg:w-[360px]">
          <ResumenPedido>
            <p className="text-sm text-texto-suave">
              Entrega en {municipio?.nombre} · Vda. {ubicacion.vereda}, finca {ubicacion.finca}. Puedes cambiarla en el siguiente paso.
            </p>
            {lineas.some((l) => l.producto.requiereFormula) && (
              <Alerta tipo="formula">Tu pedido tiene productos que requieren fórmula veterinaria.</Alerta>
            )}
            <BotonLink to="/checkout" className="w-full">Continuar al pago</BotonLink>
          </ResumenPedido>
        </aside>
      </div>
    </div>
  );
}
