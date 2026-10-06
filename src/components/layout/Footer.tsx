import { Link } from 'react-router-dom';
import { reiniciarDemo } from '../../store/reiniciar';
import { Chip } from '../ui/Chip';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-borde bg-white pb-20 md:pb-0">
      <div className="contenedor grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-texto-suave">Insumos agropecuarios con registro ICA, puestos en tu finca.</p>
        </div>
        <div>
          <h2 className="mb-2 text-sm uppercase tracking-wide text-texto-suave">Ayuda</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li><Link className="hover:underline" to="/info/ica">Cómo verificamos el ICA</Link></li>
            <li><Link className="hover:underline" to="/info/retracto">Política de retracto</Link></li>
            <li><Link className="hover:underline" to="/info/envios">Envíos y cadena de frío</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm uppercase tracking-wide text-texto-suave">Vende con nosotros</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li><Link className="hover:underline" to="/vender/registro">Quiero vender</Link></li>
            <li><Link className="hover:underline" to="/ingresar">Usuarios de prueba</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm uppercase tracking-wide text-texto-suave">Medios de pago</h2>
          <div className="flex flex-wrap gap-1.5">
            <Chip>Contra entrega</Chip>
            <Chip>PSE</Chip>
            <Chip>Nequi / Daviplata</Chip>
          </div>
        </div>
      </div>
      <div className="border-t border-borde">
        <div className="contenedor flex flex-wrap items-center justify-between gap-3 py-4 text-xs text-texto-suave">
          <p>Prototipo académico · datos y registros ICA de ejemplo · sin pagos reales.</p>
          <button type="button" onClick={reiniciarDemo} className="min-h-10 rounded-lg px-2 font-semibold underline hover:text-texto">
            Reiniciar datos de demostración
          </button>
        </div>
      </div>
    </footer>
  );
}
