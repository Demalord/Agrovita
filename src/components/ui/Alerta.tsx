import type { ReactNode } from 'react';
import { IconoAlerta, IconoCheck, IconoFrio, IconoInfo, IconoReceta } from './Iconos';

type Tipo = 'info' | 'aviso' | 'error' | 'exito' | 'formula' | 'frio';

const estilos: Record<Tipo, { caja: string; icono: ReactNode }> = {
  info: { caja: 'border-[#cfd8e3] bg-[#f1f5f9]', icono: <IconoInfo className="text-texto-suave" /> },
  aviso: { caja: 'border-acento bg-acento-suave', icono: <IconoAlerta className="text-[#7a5200]" /> },
  error: { caja: 'border-formula bg-formula-suave', icono: <IconoAlerta className="text-formula" /> },
  exito: { caja: 'border-primario bg-primario-suave', icono: <IconoCheck className="text-primario-oscuro" /> },
  formula: { caja: 'border-formula/40 bg-formula-suave', icono: <IconoReceta className="text-formula" /> },
  frio: { caja: 'border-frio/40 bg-frio-suave', icono: <IconoFrio className="text-frio" /> },
};

export function Alerta({ tipo = 'info', titulo, children, rol }: { tipo?: Tipo; titulo?: string; children?: ReactNode; rol?: 'alert' | 'status' | 'note' }) {
  const e = estilos[tipo];
  return (
    <div role={rol ?? (tipo === 'error' ? 'alert' : 'note')} className={`flex items-start gap-3 rounded-lg border p-4 ${e.caja}`}>
      <span className="mt-0.5 shrink-0">{e.icono}</span>
      <div className="text-sm leading-relaxed">
        {titulo && <p className="text-[15px] font-semibold">{titulo}</p>}
        {children}
      </div>
    </div>
  );
}
