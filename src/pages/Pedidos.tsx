import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alerta } from '../components/ui/Alerta';
import { Boton, BotonLink } from '../components/ui/Boton';
import { Chip } from '../components/ui/Chip';
import { IconoCheck, IconoSalir } from '../components/ui/Iconos';
import { Modal } from '../components/ui/Modal';
import { buscarMunicipio } from '../services/envio';
import { diasHabilesRestantes, fechaLimite } from '../services/retracto';
import { usePedidos } from '../store/pedidos';
import { useSesion } from '../store/sesion';
import type { EstadoPedido, Pedido } from '../types';
import { fechaCorta } from '../utils/fechas';
import { formatoCOP, nombresEstadoPedido, nombresMetodoPago } from '../utils/formato';

const etapas: EstadoPedido[] = ['recibido', 'despachado', 'en-camino', 'entregado'];

function chipEstado(estado: EstadoPedido) {
  const tono = estado === 'entregado' ? 'exito' : estado === 'retracto-solicitado' ? 'aviso' : estado === 'en-camino' ? 'frio' : 'neutro';
  return <Chip tono={tono}>{nombresEstadoPedido[estado]}</Chip>;
}

function LineaTiempo({ estado }: { estado: EstadoPedido }) {
  const nivel = estado === 'retracto-solicitado' ? 4 : etapas.indexOf(estado) + 1;
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Estado del pedido">
      {etapas.map((e, i) => (
        <li key={e} className={`flex items-center gap-2 text-sm font-semibold ${i < nivel ? 'text-primario-oscuro' : 'text-[#9a9fa8]'}`}>
          <span className={`grid size-6 place-items-center rounded-full ${i < nivel ? 'bg-primario text-white' : 'border-2 border-[#c9c3b5]'}`}>
            {i < nivel && <IconoCheck size={14} />}
          </span>
          {nombresEstadoPedido[e]}
          {i < etapas.length - 1 && <span className={`h-0.5 w-6 ${i < nivel - 1 ? 'bg-primario' : 'bg-borde'}`} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

function BloqueRetracto({ pedido, onSolicitar }: { pedido: Pedido; onSolicitar: () => void }) {
  if (pedido.estado === 'retracto-solicitado') {
    return (
      <Alerta tipo="aviso" titulo="Retracto solicitado">
        Reembolso estimado: {formatoCOP(pedido.total)} en 5 a 8 días hábiles. Recogeremos el producto en la finca.
      </Alerta>
    );
  }
  if (pedido.estado !== 'entregado' || !pedido.fechaEntrega) {
    return <p className="text-sm text-texto-suave">El retracto se habilita cuando recibas el pedido (5 días hábiles desde la entrega).</p>;
  }
  const restantes = diasHabilesRestantes(pedido.fechaEntrega);
  if (restantes === 0) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Boton disabled>Solicitar retracto</Boton>
        <span className="text-sm text-texto-suave">Plazo de retracto vencido el {fechaCorta(fechaLimite(pedido.fechaEntrega))}.</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-acento-suave p-3">
      <Boton onClick={onSolicitar}>Solicitar retracto</Boton>
      <span className="text-sm font-semibold">
        {restantes === 1 ? 'Queda 1 día hábil' : `Quedan ${restantes} días hábiles`} · hasta el {fechaCorta(fechaLimite(pedido.fechaEntrega))}
      </span>
    </div>
  );
}

export default function Pedidos() {
  const usuario = useSesion((s) => s.usuario);
  const salir = useSesion((s) => s.salir);
  const pedidos = usePedidos((s) => s.pedidos).filter((p) => p.compradorId === usuario?.id);
  const solicitarRetracto = usePedidos((s) => s.solicitarRetracto);
  const [abierto, setAbierto] = useState<string | null>(pedidos[0]?.id ?? null);
  const [confirmar, setConfirmar] = useState<Pedido | null>(null);

  return (
    <div className="contenedor pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Mis pedidos</h1>
          <p className="text-texto-suave">{usuario?.nombre} · {usuario?.detalle}</p>
        </div>
        <Boton variante="secundario" tamano="sm" onClick={salir}><IconoSalir size={18} /> Cerrar sesión</Boton>
      </div>

      {pedidos.length === 0 ? (
        <div className="tarjeta flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-lg font-semibold">Todavía no tienes pedidos.</p>
          <BotonLink to="/catalogo">Ver catálogo</BotonLink>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {pedidos.map((p) => {
            const expandido = abierto === p.id;
            return (
              <li key={p.id} className="tarjeta">
                <button
                  type="button"
                  onClick={() => setAbierto(expandido ? null : p.id)}
                  aria-expanded={expandido}
                  className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-left"
                >
                  <strong className="min-w-28">{p.id}</strong>
                  <span className="min-w-28 text-texto-suave">{fechaCorta(p.fechaCreacion)}</span>
                  <span className="min-w-24 font-semibold">{formatoCOP(p.total)}</span>
                  {chipEstado(p.estado)}
                  <span className="ml-auto text-sm font-semibold text-primario-oscuro underline">{expandido ? 'Ocultar' : 'Ver detalle'}</span>
                </button>
                {expandido && (
                  <div className="flex flex-col gap-4 border-t border-borde px-5 py-4">
                    <LineaTiempo estado={p.estado} />
                    <ul className="flex flex-col gap-1 text-[15px]">
                      {p.items.map((i) => (
                        <li key={i.productoId}>
                          {i.cantidad} × <Link to={`/producto/${i.productoId}`} className="hover:underline">{i.nombre}</Link> · {i.presentacion}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-texto-suave">
                      Entrega en finca {p.entrega.finca}, Vda. {p.entrega.vereda}, {buscarMunicipio(p.entrega.municipioId)?.nombre} · {nombresMetodoPago[p.metodoPago]}
                      {p.fechaEntrega && ` · entregado el ${fechaCorta(p.fechaEntrega)}`}
                    </p>
                    <BloqueRetracto pedido={p} onSolicitar={() => setConfirmar(p)} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Modal abierto={!!confirmar} titulo="¿Solicitar retracto?" onCerrar={() => setConfirmar(null)}>
        {confirmar && (
          <div className="flex flex-col gap-4">
            <p>
              Vas a retractarte del pedido <strong>{confirmar.id}</strong>. Te devolveremos {formatoCOP(confirmar.total)} y recogeremos el producto en tu finca.
            </p>
            <p className="text-sm text-texto-suave">El producto debe estar sin abrir y en su empaque original.</p>
            <div className="flex flex-wrap justify-end gap-3">
              <Boton variante="secundario" onClick={() => setConfirmar(null)}>Cancelar</Boton>
              <Boton
                onClick={() => {
                  solicitarRetracto(confirmar.id);
                  setConfirmar(null);
                }}
              >
                Sí, solicitar retracto
              </Boton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
