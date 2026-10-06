import { useState } from 'react';
import { textoEstadoIca, verificar } from '../../services/ica';
import type { ResultadoIca } from '../../types';
import { fechaCorta } from '../../utils/fechas';
import { Boton } from '../ui/Boton';
import { Chip } from '../ui/Chip';
import { IconoEscudo } from '../ui/Iconos';

/** Bloque de registro ICA con botón "Verificar registro" (RN-02). */
export function VerificarIca({ numero, titular }: { numero: string; titular?: string }) {
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIca | null>(null);

  async function consultar() {
    setCargando(true);
    setResultado(await verificar(numero));
    setCargando(false);
  }

  const tono = !resultado ? 'ica' : resultado.estado === 'vigente' ? 'exito' : 'error';

  return (
    <div className="tarjeta flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primario-suave text-primario-oscuro">
          <IconoEscudo />
        </span>
        <div className="text-sm">
          <p className="text-[15px] font-semibold">
            Registro ICA <span className="font-mono">{numero}</span>
          </p>
          {titular && <p className="text-texto-suave">Titular: {titular}</p>}
          <p className="mt-1 flex flex-wrap items-center gap-2" aria-live="polite">
            Estado:
            <Chip tono={tono}>{resultado ? textoEstadoIca[resultado.estado] : 'Vigente'}</Chip>
            {resultado?.vence && <span className="text-texto-suave">Vence: {fechaCorta(resultado.vence)}</span>}
            {resultado && <span className="text-texto-suave">· verificado ahora</span>}
          </p>
        </div>
      </div>
      <Boton variante="secundario" tamano="sm" onClick={consultar} cargando={cargando}>
        {cargando ? 'Consultando…' : 'Verificar registro'}
      </Boton>
    </div>
  );
}
