import { useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useCarrito, contarUnidades } from '../../store/carrito';
import { useSesion } from '../../store/sesion';
import { buscarMunicipio } from '../../services/envio';
import { IconoBuscar, IconoCarrito, IconoUbicacion, IconoUsuario } from '../ui/Iconos';
import { Logo } from './Logo';
import { SelectorUbicacion } from './SelectorUbicacion';

export const categoriasMenu = [
  { id: 'concentrados', nombre: 'Concentrados' },
  { id: 'sales', nombre: 'Sales mineralizadas' },
  { id: 'equipos', nombre: 'Equipos' },
  { id: 'medicamentos', nombre: 'Medicamentos' },
  { id: 'biologicos', nombre: 'Vacunas' },
];

export function Header() {
  const unidades = useCarrito((s) => contarUnidades(s.items));
  const usuario = useSesion((s) => s.usuario);
  const ubicacion = useSesion((s) => s.ubicacion);
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [ubicacionAbierta, setUbicacionAbierta] = useState(false);
  const navigate = useNavigate();
  const municipio = buscarMunicipio(ubicacion.municipioId);
  const categoriaActual = params.get('categoria');

  const destinoCuenta = !usuario ? '/ingresar' : usuario.rol === 'vendedor' ? '/vendedor' : usuario.rol === 'admin' ? '/admin' : '/cuenta/pedidos';

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-primario-oscuro text-white">
        <div className="contenedor flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
          <Logo claro />
          <form
            role="search"
            className="order-last flex w-full gap-2 md:order-none md:w-auto md:flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/catalogo?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <label htmlFor="buscar" className="sr-only">Buscar productos</label>
            <input
              id="buscar"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar concentrados, sales, equipos…"
              className="min-h-12 w-full min-w-0 rounded-lg border-0 bg-white px-4 text-base text-texto placeholder:text-[#8a8f98] focus:outline-none focus:ring-3 focus:ring-acento"
            />
            <button type="submit" className="grid min-h-12 w-12 shrink-0 place-items-center rounded-lg bg-acento text-texto hover:brightness-95" aria-label="Buscar">
              <IconoBuscar />
            </button>
          </form>
          <button
            type="button"
            onClick={() => setUbicacionAbierta(true)}
            className="flex min-h-12 items-center gap-2 rounded-lg px-2 text-left hover:bg-white/10"
          >
            <IconoUbicacion className="shrink-0 text-acento" />
            <span className="leading-tight">
              <span className="block text-xs text-white/75">Entregar en</span>
              <span className="block text-sm font-semibold">{municipio?.nombre} · Vda. {ubicacion.vereda}</span>
            </span>
          </button>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link to={destinoCuenta} className="flex min-h-12 items-center gap-2 rounded-lg px-3 hover:bg-white/10">
              <IconoUsuario />
              <span className="hidden text-sm font-semibold sm:inline">{usuario ? usuario.nombre.split(' ')[0] : 'Ingresar'}</span>
            </Link>
            <Link to="/carrito" className="relative flex min-h-12 items-center gap-2 rounded-lg px-3 hover:bg-white/10" aria-label={`Carrito, ${unidades} productos`}>
              <IconoCarrito />
              <span className="hidden text-sm font-semibold sm:inline">Carrito</span>
              {unidades > 0 && (
                <span className="absolute right-0.5 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-acento px-1 text-xs font-bold text-texto">{unidades}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
      <nav aria-label="Categorías" className="border-b border-borde bg-white">
        <div className="contenedor flex gap-6 overflow-x-auto">
          {categoriasMenu.map((c) => (
            <NavLink
              key={c.id}
              to={`/catalogo?categoria=${c.id}`}
              className={() =>
                `flex min-h-11 items-center whitespace-nowrap border-b-3 text-sm font-semibold ${
                  categoriaActual === c.id ? 'border-primario text-primario-oscuro' : 'border-transparent text-texto hover:text-primario-oscuro'
                }`
              }
            >
              {c.nombre}
            </NavLink>
          ))}
        </div>
      </nav>
      <SelectorUbicacion abierto={ubicacionAbierta} onCerrar={() => setUbicacionAbierta(false)} />
    </header>
  );
}
