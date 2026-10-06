import { NavLink, useParams } from 'react-router-dom';
import { IconoCheck } from '../components/ui/Iconos';
import { RECARGO_FRIO } from '../services/envio';
import { formatoCOP } from '../utils/formato';

const temas: Record<string, { titulo: string; lead: string; puntos: string[]; fuente: string }> = {
  ica: {
    titulo: 'Cómo verificamos el registro ICA',
    lead: 'Solo publicamos vendedores y productos con registro ICA vigente.',
    puntos: [
      'Todo vendedor registra el número ICA de su almacén antes de publicar. Sin número no puede vender.',
      'Cada producto debe tener su propio registro vigente. Si no existe o está vencido, no se publica.',
      'Puedes consultar el número desde la ficha de cada producto con el botón “Verificar registro”.',
      'Los medicamentos de venta bajo fórmula exigen una fórmula de médico veterinario de máximo 30 días.',
    ],
    fuente: 'Instituto Colombiano Agropecuario (2021, 2025a, 2025b). En este prototipo la consulta usa una lista local de registros de ejemplo.',
  },
  retracto: {
    titulo: 'Política de retracto y devoluciones',
    lead: 'Tienes 5 días hábiles desde la entrega para retractarte de tu compra.',
    puntos: [
      'Solicítalo desde Mis pedidos con el botón “Solicitar retracto”. Verás cuántos días hábiles te quedan.',
      'Los sábados, domingos y festivos no cuentan como días hábiles.',
      'El producto debe estar sin abrir y en su empaque original.',
      'Te devolvemos el valor pagado, incluido el envío.',
    ],
    fuente: 'Congreso de la República de Colombia (2011). Ley 1480, Estatuto del Consumidor.',
  },
  envios: {
    titulo: 'Envíos y cadena de frío',
    lead: 'El precio que ves en cada producto ya incluye el envío hasta tu finca.',
    puntos: [
      'El costo depende de tu municipio y del peso del pedido. Cada vendedor despacha por separado.',
      'Vacunas y biológicos viajan refrigerados entre 2 y 8 °C durante todo el trayecto.',
      `El envío refrigerado tiene un recargo de ${formatoCOP(RECARGO_FRIO)} por vendedor, que se muestra antes de pagar.`,
      'Puedes pagar contra entrega, por PSE o con Nequi / Daviplata.',
    ],
    fuente: 'Instituto Colombiano Agropecuario (2021).',
  },
};

export default function Info() {
  const { tema = 'ica' } = useParams();
  const t = temas[tema] ?? temas.ica;
  return (
    <div className="contenedor flex flex-col gap-8 pt-8 md:flex-row md:items-start">
      <nav aria-label="Temas de ayuda" className="flex gap-2 overflow-x-auto md:w-64 md:shrink-0 md:flex-col">
        {Object.entries(temas).map(([id, x]) => (
          <NavLink
            key={id}
            to={`/info/${id}`}
            className={({ isActive }) => `flex min-h-12 items-center whitespace-nowrap rounded-lg px-4 font-semibold ${isActive ? 'bg-primario text-white' : 'hover:bg-primario-suave'}`}
          >
            {x.titulo}
          </NavLink>
        ))}
      </nav>
      <article className="max-w-3xl flex-1">
        <h1 className="mb-3 text-3xl">{t.titulo}</h1>
        <p className="mb-6 text-lg text-texto-suave">{t.lead}</p>
        <ul className="tarjeta flex flex-col gap-4 p-6">
          {t.puntos.map((p) => (
            <li key={p} className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primario-suave text-primario-oscuro"><IconoCheck size={14} /></span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-texto-suave">Fuente: {t.fuente}</p>
      </article>
    </div>
  );
}
