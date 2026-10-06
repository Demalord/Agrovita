import { NavLink } from 'react-router-dom';
import { useCarrito, contarUnidades } from '../../store/carrito';
import { useSesion } from '../../store/sesion';
import { IconoCarrito, IconoCasa, IconoCuadricula, IconoUsuario } from '../ui/Iconos';

/** Barra inferior en móvil (RF-11). */
export function BottomNav() {
  const unidades = useCarrito((s) => contarUnidades(s.items));
  const usuario = useSesion((s) => s.usuario);
  const cuenta = !usuario ? '/ingresar' : usuario.rol === 'vendedor' ? '/vendedor' : usuario.rol === 'admin' ? '/admin' : '/cuenta/pedidos';
  const items = [
    { to: '/', label: 'Inicio', icono: <IconoCasa />, end: true },
    { to: '/catalogo', label: 'Categorías', icono: <IconoCuadricula /> },
    { to: '/carrito', label: 'Carrito', icono: <IconoCarrito />, badge: unidades },
    { to: cuenta, label: 'Cuenta', icono: <IconoUsuario /> },
  ];
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-white md:hidden">
      <ul className="grid grid-cols-4">
        {items.map((i) => (
          <li key={i.label}>
            <NavLink
              to={i.to}
              end={i.end}
              className={({ isActive }) => `relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${isActive ? 'text-primario-oscuro' : 'text-texto-suave'}`}
            >
              {i.icono}
              {i.label}
              {i.badge ? (
                <span className="absolute left-1/2 top-1.5 ml-2 grid h-5 min-w-5 place-items-center rounded-full bg-acento px-1 text-[11px] font-bold text-texto">{i.badge}</span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
