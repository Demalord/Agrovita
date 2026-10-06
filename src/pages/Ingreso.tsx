import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Boton } from '../components/ui/Boton';
import { IconoFlecha, IconoGrafico, IconoPaquete, IconoUsuario } from '../components/ui/Iconos';
import { useSesion, usuariosPrueba } from '../store/sesion';
import type { Rol } from '../types';

const iconos: Record<Rol, React.ReactNode> = {
  comprador: <IconoUsuario />,
  vendedor: <IconoPaquete />,
  admin: <IconoGrafico />,
};

const destinos: Record<Rol, string> = { comprador: '/', vendedor: '/vendedor', admin: '/admin' };
const nombresRol: Record<Rol, string> = { comprador: 'Comprador', vendedor: 'Vendedor', admin: 'Administrador' };

export default function Ingreso() {
  const ingresar = useSesion((s) => s.ingresar);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rolPedido = params.get('rol') as Rol | null;
  const volver = params.get('volver');

  function entrar(id: string, rol: Rol) {
    ingresar(id);
    navigate(volver && rolPedido === rol ? volver : destinos[rol], { replace: true });
  }

  return (
    <div className="contenedor flex justify-center pt-10">
      <div className="tarjeta flex w-full max-w-md flex-col gap-6 p-7">
        <h1 className="text-2xl">Ingresa a tu cuenta</h1>
        {rolPedido && <Alerta tipo="info">Para continuar, ingresa como {nombresRol[rolPedido].toLowerCase()}.</Alerta>}

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            entrar('u1', 'comprador');
          }}
        >
          <div>
            <label className="etiqueta" htmlFor="correo">Correo</label>
            <input id="correo" type="email" className="campo" placeholder="tucorreo@ejemplo.com" autoComplete="email" />
          </div>
          <div>
            <label className="etiqueta" htmlFor="clave">Contraseña</label>
            <input id="clave" type="password" className="campo" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <Boton type="submit">Ingresar</Boton>
          <p className="text-xs text-texto-suave">En el prototipo el formulario es decorativo: entra como comprador de prueba.</p>
        </form>

        <div className="flex flex-col gap-3 border-t border-borde pt-5">
          <h2 className="text-base">Entrar como usuario de prueba</h2>
          {usuariosPrueba.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => entrar(u.id, u.rol)}
              className={`flex min-h-16 items-center gap-4 rounded-lg border px-4 py-3 text-left hover:border-primario hover:bg-primario-suave ${rolPedido === u.rol ? 'border-2 border-primario' : 'border-[#c9c3b5]'}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primario-suave text-primario-oscuro">{iconos[u.rol]}</span>
              <span className="flex-1">
                <span className="block font-semibold">{nombresRol[u.rol]}</span>
                <span className="block text-sm text-texto-suave">{u.detalle}</span>
              </span>
              <IconoFlecha size={18} className="text-texto-suave" />
            </button>
          ))}
        </div>

        <p className="text-center text-sm">
          ¿Tienes un almacén con registro ICA? <Link to="/vender/registro" className="font-semibold text-primario-oscuro underline">Quiero vender</Link>
        </p>
      </div>
    </div>
  );
}
