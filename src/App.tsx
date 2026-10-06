import { Route, Routes } from 'react-router-dom';
import { Layout, RutaProtegida } from './components/layout/Layout';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import Producto from './pages/Producto';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Confirmacion from './pages/Confirmacion';
import Pedidos from './pages/Pedidos';
import Ingreso from './pages/Ingreso';
import RegistroVendedor from './pages/RegistroVendedor';
import PanelVendedor from './pages/PanelVendedor';
import Admin from './pages/Admin';
import Info from './pages/Info';
import { BotonLink } from './components/ui/Boton';

function NoEncontrada() {
  return (
    <div className="contenedor py-20 text-center">
      <h1 className="mb-3 text-3xl">Página no encontrada</h1>
      <p className="mb-6 text-texto-suave">La dirección no existe en el prototipo.</p>
      <BotonLink to="/">Volver al inicio</BotonLink>
    </div>
  );
}

/** Una ruta por pantalla de la especificación (P01–P12). */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="producto/:id" element={<Producto />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout" element={<RutaProtegida rol="comprador"><Checkout /></RutaProtegida>} />
        <Route path="pedido/:id/confirmado" element={<RutaProtegida rol="comprador"><Confirmacion /></RutaProtegida>} />
        <Route path="cuenta/pedidos" element={<RutaProtegida rol="comprador"><Pedidos /></RutaProtegida>} />
        <Route path="ingresar" element={<Ingreso />} />
        <Route path="vender/registro" element={<RegistroVendedor />} />
        <Route path="vendedor" element={<RutaProtegida rol="vendedor"><PanelVendedor /></RutaProtegida>} />
        <Route path="admin" element={<RutaProtegida rol="admin"><Admin /></RutaProtegida>} />
        <Route path="info/:tema" element={<Info />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
