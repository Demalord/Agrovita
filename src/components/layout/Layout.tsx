import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Rol } from '../../types';
import { useSesion } from '../../store/sesion';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Header } from './Header';

function SubirAlNavegar() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <SubirAlNavegar />
      <Header />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

/** Redirige al ingreso si no hay sesión con el rol pedido (RF-10). */
export function RutaProtegida({ rol, children }: { rol: Rol; children: React.ReactNode }) {
  const usuario = useSesion((s) => s.usuario);
  const location = useLocation();
  if (!usuario || usuario.rol !== rol) {
    return <Navigate to={`/ingresar?rol=${rol}&volver=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}
