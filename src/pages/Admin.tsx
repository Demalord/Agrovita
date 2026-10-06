import { useState } from 'react';
import { Alerta } from '../components/ui/Alerta';
import { Boton } from '../components/ui/Boton';
import { Chip } from '../components/ui/Chip';
import { IconoSalir } from '../components/ui/Iconos';
import { consultarRegistro, textoEstadoIca } from '../services/ica';
import { validarFechaFormula } from '../services/formula';
import { useCatalogo } from '../store/catalogo';
import { usePedidos } from '../store/pedidos';
import { useSesion } from '../store/sesion';
import { reiniciarDemo } from '../store/reiniciar';
import type { ResultadoIca } from '../types';
import { fechaCorta } from '../utils/fechas';

type Tab = 'vendedores' | 'productos' | 'formulas';

function ChipVerificacion({ r }: { r: ResultadoIca }) {
  return <Chip tono={r.estado === 'vigente' ? 'exito' : 'error'}>{textoEstadoIca[r.estado]}</Chip>;
}

function Acciones({ sugerido, onAprobar, onRechazar }: { sugerido: boolean; onAprobar: () => void; onRechazar: (motivo: string) => void }) {
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  if (rechazando) {
    return (
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onRechazar(motivo.trim() || 'sin motivo');
        }}
      >
        <label className="sr-only" htmlFor="motivo">Motivo del rechazo</label>
        <input id="motivo" autoFocus className="campo min-h-10 w-48" placeholder="Motivo del rechazo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        <Boton type="submit" variante="peligro" tamano="sm">Rechazar</Boton>
        <Boton variante="fantasma" tamano="sm" onClick={() => setRechazando(false)}>Cancelar</Boton>
      </form>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Boton tamano="sm" onClick={onAprobar} disabled={!sugerido} title={sugerido ? undefined : 'No se puede aprobar con un registro no vigente'}>Aprobar</Boton>
      <Boton tamano="sm" variante="peligro" onClick={() => setRechazando(true)}>Rechazar</Boton>
    </div>
  );
}

export default function Admin() {
  const salir = useSesion((s) => s.salir);
  const vendedores = useCatalogo((s) => s.vendedores);
  const productos = useCatalogo((s) => s.productos);
  const setEstadoVendedor = useCatalogo((s) => s.setEstadoVendedor);
  const setEstadoProducto = useCatalogo((s) => s.setEstadoProducto);
  const pedidos = usePedidos((s) => s.pedidos);
  const setEstadoFormula = usePedidos((s) => s.setEstadoFormula);
  const [tab, setTab] = useState<Tab>('vendedores');
  const [aviso, setAviso] = useState('');

  const vendPend = vendedores.filter((v) => v.estado === 'pendiente');
  const prodPend = productos.filter((p) => p.estado === 'pendiente');
  const formPend = pedidos.filter((p) => p.formula?.estado === 'por-validar');
  const nombreVendedor = (id: string) => vendedores.find((v) => v.id === id)?.razonSocial ?? id;

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: 'vendedores', label: 'Vendedores pendientes', n: vendPend.length },
    { id: 'productos', label: 'Productos pendientes', n: prodPend.length },
    { id: 'formulas', label: 'Fórmulas por validar', n: formPend.length },
  ];

  const hecho = (txt: string) => setAviso(txt);

  return (
    <div className="contenedor pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-texto-suave">Administración</p>
          <h1 className="text-3xl">Revisión y aprobación</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" tamano="sm" onClick={reiniciarDemo}>Reiniciar demo</Boton>
          <Boton variante="secundario" tamano="sm" onClick={salir}><IconoSalir size={18} /> Salir</Boton>
        </div>
      </div>

      <div role="tablist" aria-label="Pendientes" className="mb-5 flex gap-1 overflow-x-auto border-b border-borde">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); setAviso(''); }}
            className={`flex min-h-12 items-center gap-2 whitespace-nowrap border-b-3 px-4 font-semibold ${tab === t.id ? 'border-primario text-primario-oscuro' : 'border-transparent text-texto-suave hover:text-texto'}`}
          >
            {t.label}
            <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs ${t.n ? 'bg-acento text-texto' : 'bg-[#efece4] text-texto-suave'}`}>{t.n}</span>
          </button>
        ))}
      </div>

      {aviso && <div className="mb-4"><Alerta tipo="exito" rol="status">{aviso}</Alerta></div>}

      <div className="tarjeta overflow-x-auto" role="tabpanel">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-[#fbfaf6]">
            <tr className="border-b border-borde">
              <th className="px-4 py-3 font-semibold">{tab === 'vendedores' ? 'Vendedor' : tab === 'productos' ? 'Producto' : 'Pedido'}</th>
              <th className="px-4 py-3 font-semibold">{tab === 'vendedores' ? 'Municipio' : tab === 'productos' ? 'Vendedor' : 'Veterinario'}</th>
              <th className="px-4 py-3 font-semibold">Número</th>
              <th className="px-4 py-3 font-semibold">Verificación simulada</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tab === 'vendedores' &&
              vendPend.map((v) => {
                const r = consultarRegistro(v.registroIca);
                return (
                  <tr key={v.id} className="border-b border-borde last:border-b-0">
                    <td className="px-4 py-3"><strong>{v.razonSocial}</strong><br /><span className="text-texto-suave">NIT {v.nit}</span></td>
                    <td className="px-4 py-3">{v.municipio}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.registroIca}</td>
                    <td className="px-4 py-3"><ChipVerificacion r={r} /></td>
                    <td className="px-4 py-3">
                      <Acciones
                        sugerido={r.estado === 'vigente'}
                        onAprobar={() => { setEstadoVendedor(v.id, 'aprobado'); hecho(`${v.razonSocial} aprobado: ya puede publicar productos.`); }}
                        onRechazar={(m) => { setEstadoVendedor(v.id, 'rechazado', m); hecho(`${v.razonSocial} rechazado.`); }}
                      />
                    </td>
                  </tr>
                );
              })}
            {tab === 'productos' &&
              prodPend.map((p) => {
                const r = consultarRegistro(p.registroIca);
                return (
                  <tr key={p.id} className="border-b border-borde last:border-b-0">
                    <td className="px-4 py-3">
                      <strong>{p.nombre}</strong><br />
                      <span className="text-texto-suave">{p.presentacion}{p.requiereFormula ? ' · requiere fórmula' : ''}{p.requiereFrio ? ' · cadena de frío' : ''}</span>
                    </td>
                    <td className="px-4 py-3">{nombreVendedor(p.vendedorId)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.registroIca}</td>
                    <td className="px-4 py-3"><ChipVerificacion r={r} />{r.vence && <span className="ml-2 text-xs text-texto-suave">vence {fechaCorta(r.vence)}</span>}</td>
                    <td className="px-4 py-3">
                      <Acciones
                        sugerido={r.estado === 'vigente'}
                        onAprobar={() => { setEstadoProducto(p.id, 'aprobado'); hecho(`${p.nombre} aprobado: ya aparece en la tienda.`); }}
                        onRechazar={(m) => { setEstadoProducto(p.id, 'rechazado', m); hecho(`${p.nombre} rechazado.`); }}
                      />
                    </td>
                  </tr>
                );
              })}
            {tab === 'formulas' &&
              formPend.map((p) => {
                const f = p.formula!;
                const v = validarFechaFormula(f.fechaExpedicion);
                return (
                  <tr key={p.id} className="border-b border-borde last:border-b-0">
                    <td className="px-4 py-3">
                      <strong>{p.id}</strong><br />
                      <span className="text-texto-suave">{p.entrega.nombre} · {f.archivo}</span>
                    </td>
                    <td className="px-4 py-3">{f.veterinario}</td>
                    <td className="px-4 py-3 font-mono text-xs">{f.tarjetaProfesional}</td>
                    <td className="px-4 py-3">
                      <Chip tono={v.valida ? 'exito' : 'error'}>{v.valida ? `Expedida hace ${v.diasDesdeExpedicion} días` : 'Más de 30 días'}</Chip>
                    </td>
                    <td className="px-4 py-3">
                      <Acciones
                        sugerido={v.valida}
                        onAprobar={() => { setEstadoFormula(p.id, 'valida'); hecho(`Fórmula del pedido ${p.id} validada.`); }}
                        onRechazar={() => { setEstadoFormula(p.id, 'rechazada'); hecho(`Fórmula del pedido ${p.id} rechazada.`); }}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {((tab === 'vendedores' && vendPend.length === 0) || (tab === 'productos' && prodPend.length === 0) || (tab === 'formulas' && formPend.length === 0)) && (
          <p className="p-8 text-center text-texto-suave">No hay pendientes en esta pestaña.</p>
        )}
      </div>
      <p className="mt-3 text-sm text-texto-suave">La verificación consulta la lista local de registros ICA del prototipo; no se conecta al ICA real.</p>
    </div>
  );
}
