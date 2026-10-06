import { useEffect, useState } from 'react';
import { municipios } from '../../services/envio';
import { useSesion } from '../../store/sesion';
import { Boton } from '../ui/Boton';
import { Modal } from '../ui/Modal';

/** Modal "Entregar en": cambia el municipio y recalcula el precio puesto en finca (RF-03). */
export function SelectorUbicacion({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const ubicacion = useSesion((s) => s.ubicacion);
  const setUbicacion = useSesion((s) => s.setUbicacion);
  const [borrador, setBorrador] = useState(ubicacion);

  useEffect(() => {
    if (abierto) setBorrador(ubicacion);
  }, [abierto, ubicacion]);

  const departamentos = [...new Set(municipios.map((m) => m.departamento))];

  return (
    <Modal abierto={abierto} titulo="¿Dónde recibes tus pedidos?" onCerrar={onCerrar}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setUbicacion(borrador);
          onCerrar();
        }}
      >
        <p className="text-sm text-texto-suave">El precio total de cada producto incluye el envío hasta tu finca.</p>
        <div>
          <label className="etiqueta" htmlFor="ub-municipio">Municipio</label>
          <select id="ub-municipio" className="campo" value={borrador.municipioId} onChange={(e) => setBorrador({ ...borrador, municipioId: e.target.value })}>
            {departamentos.map((d) => (
              <optgroup key={d} label={d}>
                {municipios.filter((m) => m.departamento === d).map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="ub-vereda">Vereda</label>
            <input id="ub-vereda" className="campo" value={borrador.vereda} onChange={(e) => setBorrador({ ...borrador, vereda: e.target.value })} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="ub-finca">Finca</label>
            <input id="ub-finca" className="campo" value={borrador.finca} onChange={(e) => setBorrador({ ...borrador, finca: e.target.value })} />
          </div>
        </div>
        <Boton type="submit">Guardar ubicación</Boton>
      </form>
    </Modal>
  );
}
