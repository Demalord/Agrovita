import { asset } from '../utils/asset';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import registros from '../data/registros-ica.json';
import { EtiquetasProducto, ProductCard } from '../components/producto/ProductCard';
import { VerificarIca } from '../components/producto/VerificarIca';
import { Alerta } from '../components/ui/Alerta';
import { Boton } from '../components/ui/Boton';
import { Cantidad } from '../components/ui/Cantidad';
import { ChipIca } from '../components/ui/Chip';
import { IconoCarrito, IconoEstrella } from '../components/ui/Iconos';
import { usePublicados, useVendedores } from '../hooks/useTienda';
import { buscarMunicipio, estimarProducto, RECARGO_FRIO } from '../services/envio';
import { useCarrito } from '../store/carrito';
import { useSesion } from '../store/sesion';
import { formatoCOP, nombresCategoria, nombresEspecie } from '../utils/formato';

const pestanas = ['Descripción', 'Composición / ficha técnica', 'Modo de uso', 'Envío y retracto'] as const;

export default function Producto() {
  const { id } = useParams();
  const productos = usePublicados();
  const vendedores = useVendedores();
  const producto = productos.find((p) => p.id === id);
  const ubicacion = useSesion((s) => s.ubicacion);
  const agregar = useCarrito((s) => s.agregar);
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState(1);
  const [tab, setTab] = useState(0);
  const [imagen, setImagen] = useState(0);

  if (!producto) {
    return (
      <div className="contenedor py-16 text-center">
        <h1 className="mb-3 text-2xl">Producto no disponible</h1>
        <p className="mb-6 text-texto-suave">Puede que no exista o que esté en revisión de registro ICA.</p>
        <Link to="/catalogo" className="font-semibold text-primario-oscuro underline">Volver al catálogo</Link>
      </div>
    );
  }

  const vendedor = vendedores.find((v) => v.id === producto.vendedorId);
  const municipio = buscarMunicipio(ubicacion.municipioId);
  const envio = estimarProducto(ubicacion.municipioId, producto, cantidad);
  const subtotal = producto.precio * cantidad;
  const titular = (registros as { numero: string; titular: string }[]).find((r) => r.numero === producto.registroIca)?.titular;
  const relacionados = productos.filter((p) => p.id !== producto.id && (p.categoria === producto.categoria || p.especies.some((e) => producto.especies.includes(e)))).slice(0, 4);
  const imagenes = producto.imagenes.length ? producto.imagenes : ['/img/productos/nuevo.svg'];

  const contenidoTab = [
    producto.descripcion,
    producto.composicion,
    producto.modoUso,
    `El envío a ${municipio?.nombre} tarda ${municipio?.diasEntrega} día(s) hábil(es) y su costo ya está en el total. ${producto.requiereFrio ? `Este producto viaja refrigerado (recargo de ${formatoCOP(RECARGO_FRIO)} incluido). ` : ''}Tienes 5 días hábiles desde la entrega para ejercer el derecho de retracto (Ley 1480 de 2011).`,
  ];

  return (
    <div className="contenedor pt-6">
      <nav aria-label="Migas de pan" className="mb-5 text-sm text-texto-suave">
        <Link to="/" className="hover:underline">Inicio</Link> /{' '}
        <Link to={`/catalogo?categoria=${producto.categoria}`} className="hover:underline">{nombresCategoria[producto.categoria]}</Link> / {producto.nombre}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* 1 · Galería */}
        <section aria-label="Galería">
          <div className="tarjeta aspect-square overflow-hidden">
            <img src={asset(imagenes[imagen])} alt={producto.nombre} className="size-full object-cover" />
          </div>
          {imagenes.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {imagenes.map((src, i) => (
                <button key={src} type="button" onClick={() => setImagen(i)} className={`tarjeta aspect-square overflow-hidden ${i === imagen ? 'ring-2 ring-primario' : ''}`} aria-label={`Foto ${i + 1}`}>
                  <img src={asset(src)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-5">
          {/* 2 · Nombre y vendedor */}
          <div>
            <EtiquetasProducto producto={producto} />
            <h1 className="mt-3 text-3xl leading-tight">{producto.nombre}</h1>
            <p className="mt-1 text-texto-suave">
              {producto.presentacion} · {producto.especies.map((e) => nombresEspecie[e]).join(', ')}
            </p>
            {vendedor && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                Vendido por <strong>{vendedor.razonSocial}</strong>
                <ChipIca texto="Vendedor registrado ICA" />
                <span className="flex items-center gap-1 text-texto-suave">
                  <IconoEstrella size={14} className="text-acento" /> {vendedor.calificacion.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* 3 · Caja de precio */}
          <div className="tarjeta flex flex-col gap-3 p-5">
            <div className="flex justify-between gap-3"><span>Precio unitario</span><span>{formatoCOP(producto.precio)}</span></div>
            {cantidad > 1 && <div className="flex justify-between gap-3"><span>Subtotal ({cantidad} unidades)</span><span>{formatoCOP(subtotal)}</span></div>}
            <div className="flex justify-between gap-3">
              <span>Envío a {municipio?.nombre} · Vda. {ubicacion.vereda}{producto.requiereFrio ? ' (refrigerado)' : ''}</span>
              <span>{formatoCOP(envio)}</span>
            </div>
            <div className="-mx-5 flex items-center justify-between gap-3 bg-acento-suave px-5 py-3">
              <span className="text-lg font-semibold">Total puesto en finca</span>
              <span className="text-2xl font-bold">{formatoCOP(subtotal + envio)}</span>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Cantidad valor={cantidad} onCambiar={setCantidad} max={producto.stock} />
              <Boton
                className="flex-1"
                onClick={() => {
                  agregar(producto.id, cantidad);
                  navigate('/carrito');
                }}
                disabled={producto.stock === 0}
              >
                <IconoCarrito size={18} /> Agregar al carrito
              </Boton>
            </div>
            <p className="text-sm text-texto-suave">{producto.stock} unidades disponibles · entrega en {municipio?.diasEntrega} día(s) hábil(es)</p>
          </div>

          {/* 4 · Registro ICA */}
          <VerificarIca numero={producto.registroIca} titular={titular} />

          {/* 5 · Alertas */}
          {producto.requiereFormula && (
            <Alerta tipo="formula" titulo="Requiere fórmula veterinaria">
              Deberás subirla al pagar. Solo es válida si fue expedida hace 30 días o menos.
            </Alerta>
          )}
          {producto.requiereFrio && (
            <Alerta tipo="frio" titulo="Requiere cadena de frío">
              Se envía refrigerado entre 2 y 8 °C. El costo del envío refrigerado ya está en el total.
            </Alerta>
          )}
        </section>
      </div>

      {/* 6 · Pestañas */}
      <section className="mt-12">
        <div role="tablist" aria-label="Información del producto" className="flex gap-1 overflow-x-auto border-b border-borde">
          {pestanas.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${i}`}
              aria-selected={tab === i}
              aria-controls="panel-tab"
              onClick={() => setTab(i)}
              className={`min-h-12 whitespace-nowrap border-b-3 px-4 text-[15px] font-semibold ${tab === i ? 'border-primario text-primario-oscuro' : 'border-transparent text-texto-suave hover:text-texto'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div role="tabpanel" id="panel-tab" aria-labelledby={`tab-${tab}`} className="max-w-3xl py-6 text-[15px] leading-relaxed">
          {contenidoTab[tab]}
        </div>
      </section>

      {/* 7 · Relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-5 text-2xl">También te puede servir</h2>
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {relacionados.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
