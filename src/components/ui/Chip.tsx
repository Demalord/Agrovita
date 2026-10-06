import type { ReactNode } from 'react';
import { IconoEscudo, IconoFrio, IconoReceta } from './Iconos';

type Tono = 'ica' | 'formula' | 'frio' | 'neutro' | 'exito' | 'aviso' | 'error' | 'oscuro';

const tonos: Record<Tono, string> = {
  ica: 'bg-primario-suave text-primario-oscuro',
  formula: 'bg-formula-suave text-formula',
  frio: 'bg-frio-suave text-frio',
  neutro: 'bg-[#efece4] text-texto',
  exito: 'bg-primario text-white',
  aviso: 'bg-acento-suave text-[#7a5200]',
  error: 'bg-formula text-white',
  oscuro: 'bg-texto text-white',
};

export function Chip({ tono = 'neutro', icono, children }: { tono?: Tono; icono?: ReactNode; children: ReactNode }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold ${tonos[tono]}`}>
      {icono}
      {children}
    </span>
  );
}

export const ChipIca = ({ texto = 'Registro ICA' }: { texto?: string }) => (
  <Chip tono="ica" icono={<IconoEscudo size={14} />}>{texto}</Chip>
);
export const ChipFormula = () => (
  <Chip tono="formula" icono={<IconoReceta size={14} />}>Requiere fórmula</Chip>
);
export const ChipFrio = () => (
  <Chip tono="frio" icono={<IconoFrio size={14} />}>Cadena de frío</Chip>
);
