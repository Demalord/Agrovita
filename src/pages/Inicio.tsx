import { asset } from '../utils/asset';
import { Link } from 'react-router-dom';
import { BotonLink } from '../components/ui/Boton';
import { ChipIca } from '../components/ui/Chip';
import { IconoBillete, IconoCamion, IconoEscudo, IconoEstrella, IconoFlecha } from '../components/ui/Iconos';
import { ProductCard } from '../components/producto/ProductCard';
import { categoriasMenu } from '../components/layout/Header';
import { usePublicados, useVendedores } from '../hooks/useTienda';

const imagenCategoria: Record<string, string> = {
  concentrados: '/img/productos/p01.svg',
  sales: '/img/productos/p07.svg',
  equipos: '/img/productos/p11.svg',
  medicamentos: '/img/productos/p14.svg',
  biologicos: '/img/productos/p16.svg',
};

const masComprados = ['p01', 'p07', 'p11', 'p16'];

export default function Inicio() {
  const productos = usePublicados();
  const vendedores = useVendedores().filter((v) => v.estado === 'aprobado');
  const destacados = masComprados.map((id) => productos.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <>
      {/* 1 · Banner principal */}
      <section className="bg-primario-suave">
        <div className="contenedor grid items-center gap-8 py-10 md:grid-cols-2 md:py-14">
          <div className="flex flex-col items-start gap-5">
            <ChipIca texto="Vendedores y productos verificados" />
            <h1 className="text-[32px] leading-[1.1] text-primario-oscuro md:text-[44px]">Insumos con registro ICA, puestos en tu finca</h1>
            <p className="max-w-md text-lg text-texto-suave">
              Concentrados, sales mineralizadas y equipos con el precio final, envío incluido, antes de pagar.
            </p>
            <div className="flex flex-wrap gap-3">
              <BotonLink to="/catalogo">
                Ver catálogo <IconoFlecha size={18} />
              </BotonLink>
              <BotonLink to="/info/ica" variante="secundario">
                ¿Cómo verificamos?
              </BotonLink>
            </div>
          </div>
          <img src={asset('/img/hero.svg')} alt="" className="w-full rounded-2xl" />
        </div>
      </section>

      {/* 2 · Franja de confianza */}
      <section className="contenedor -mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icono: <IconoEscudo />, titulo: 'Registro ICA verificado', texto: 'Cada producto y cada vendedor.' },
          { icono: <IconoCamion />, titulo: 'Precio final con envío', texto: 'Sabes cuánto pagas puesto en la finca.' },
          { icono: <IconoBillete />, titulo: 'Paga contra entrega', texto: 'También PSE y billeteras digitales.' },
        ].map((c) => (
          <div key={c.titulo} className="tarjeta flex items-start gap-3 p-5 shadow-sm">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primario text-white">{c.icono}</span>
            <div>
              <p className="font-semibold">{c.titulo}</p>
              <p className="text-sm text-texto-suave">{c.texto}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 3 · Categorías */}
      <section className="contenedor pt-12">
        <h2 className="mb-5 text-2xl">Compra por categoría</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categoriasMenu.map((c) => (
            <Link key={c.id} to={`/catalogo?categoria=${c.id}`} className="tarjeta group overflow-hidden transition-shadow hover:shadow-md">
              <img src={asset(imagenCategoria[c.id])} alt="" className="aspect-[4/3] w-full object-cover" />
              <span className="flex items-center justify-between p-3 font-semibold group-hover:text-primario-oscuro">
                {c.nombre}
                <IconoFlecha size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4 · Más comprados */}
      <section className="contenedor pt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl">Más comprados</h2>
          <Link to="/catalogo" className="text-sm font-semibold text-primario-oscuro underline">Ver todo</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {destacados.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </section>

      {/* 5 · ¿Cómo verificamos? */}
      <section className="contenedor pt-12">
        <div className="rounded-2xl bg-primario-oscuro p-8 text-white">
          <h2 className="mb-6 text-2xl">¿Cómo verificamos?</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {[
              ['El vendedor registra su número ICA', 'Sin número no puede publicar.'],
              ['Revisamos cada producto', 'Su registro debe estar vigente.'],
              ['Mostramos el sello', 'Puedes consultarlo en cada ficha.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-acento font-bold text-texto">{i + 1}</span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-white/80">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link to="/info/ica" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-acento underline">
            Leer más sobre la verificación <IconoFlecha size={16} />
          </Link>
        </div>
      </section>

      {/* 6 · Vendedores destacados */}
      <section className="contenedor pt-12">
        <h2 className="mb-5 text-2xl">Vendedores destacados</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {vendedores.map((v) => (
            <div key={v.id} className="tarjeta flex items-center gap-4 p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primario-suave text-lg font-bold text-primario-oscuro">
                {v.razonSocial.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{v.razonSocial}</p>
                <p className="flex items-center gap-1 text-sm text-texto-suave">
                  <IconoEstrella size={14} className="text-acento" /> {v.calificacion.toFixed(1)} · {v.municipio}
                </p>
                <div className="mt-1"><ChipIca texto="Vendedor registrado ICA" /></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
