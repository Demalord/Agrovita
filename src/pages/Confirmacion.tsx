import { Link, useLocation, useParams } from 'react-router-dom';
import { BotonLink } from '../components/ui/Boton';
import { Chip } from '../components/ui/Chip';
import { IconoCheck } from '../components/ui/Iconos';
import { buscarMunicipio } from '../services/envio';
import { usePedidos } from '../store/pedidos';
import { fechaLarga } from '../utils/fechas';
import { formatoCOP, nombresMetodoPago } from '../utils/formato';

export default function Confirmacion() {
  const { id } = useParams();
  const pedido = usePedidos((s) => s.pedidos.find((p) => p.id === id));
  const estado = useLocation().state as { referencia?: string; entregaEstimada?: string } | null;

  if (!pedido) {
    return (
      <div className="contenedor py-16 text-center">
        <h1 className="mb-4 text-2xl">No encontramos ese pedido</h1>
        <Link to="/cuenta/pedidos" className="font-semibold text-primario-oscuro underline">Ver mis pedidos</Link>
      </div>
    );
  }

  const municipio = buscarMunicipio(pedido.entrega.municipioId);

  return (
    <div className="contenedor max-w-3xl pt-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-primario text-white"><IconoCheck size={40} /></span>
        <h1 className="text-3xl">¡Pedido recibido!</h1>
        <p className="text-lg">Pedido <strong>N.º {pedido.id}</strong></p>
        {estado?.entregaEstimada && (
          <p className="text-texto-suave">
            Entrega estimada: <strong className="text-texto">{fechaLarga(estado.entregaEstimada)}</strong> en finca {pedido.entrega.finca}, Vda. {pedido.entrega.vereda}, {municipio?.nombre}.
          </p>
        )}
      </div>

      <div className="tarjeta flex flex-col gap-3 p-6">
        <ul className="flex flex-col gap-2">
          {pedido.items.map((i) => (
            <li key={i.productoId} className="flex justify-between gap-3">
              <span>{i.cantidad} × {i.nombre} · {i.presentacion}</span>
              <span>{formatoCOP(i.precio * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-3 text-texto-suave"><span>Envío a tu finca</span><span>{formatoCOP(pedido.envio)}</span></div>
        <div className="-mx-6 flex justify-between gap-3 bg-acento-suave px-6 py-3 text-xl font-bold"><span>Total</span><span>{formatoCOP(pedido.total)}</span></div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-sm">Medio de pago:</span>
          <Chip tono="ica">{nombresMetodoPago[pedido.metodoPago]}</Chip>
          {estado?.referencia && pedido.metodoPago !== 'contra-entrega' && <span className="text-sm text-texto-suave">Ref. {estado.referencia}</span>}
          {pedido.metodoPago === 'contra-entrega' && <span className="text-sm text-texto-suave">Ten el valor exacto listo al recibir.</span>}
        </div>
        {pedido.formula && (
          <p className="text-sm text-texto-suave">Fórmula veterinaria: en revisión. Te avisaremos si hay algún problema antes del despacho.</p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <BotonLink to="/cuenta/pedidos">Ver mis pedidos</BotonLink>
        <BotonLink to="/catalogo" variante="secundario">Seguir comprando</BotonLink>
      </div>
    </div>
  );
}
