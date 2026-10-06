import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro';
type Tamano = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const variantes: Record<Variante, string> = {
  primario: 'bg-primario text-white hover:bg-primario-oscuro',
  secundario: 'border border-primario bg-white text-primario-oscuro hover:bg-primario-suave',
  fantasma: 'text-primario-oscuro hover:bg-primario-suave',
  peligro: 'border border-formula bg-white text-formula hover:bg-formula-suave',
};

const tamanos: Record<Tamano, string> = {
  md: 'min-h-12 px-5 text-[15px]',
  sm: 'min-h-10 px-3.5 text-sm',
};

export function clasesBoton(variante: Variante = 'primario', tamano: Tamano = 'md', extra = '') {
  return `${base} ${variantes[variante]} ${tamanos[tamano]} ${extra}`;
}

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean;
  children: ReactNode;
}

export function Boton({ variante = 'primario', tamano = 'md', cargando, className = '', children, disabled, type = 'button', ...rest }: BotonProps) {
  return (
    <button type={type} className={clasesBoton(variante, tamano, className)} disabled={disabled || cargando} aria-busy={cargando || undefined} {...rest}>
      {cargando && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </button>
  );
}

interface BotonLinkProps extends LinkProps {
  variante?: Variante;
  tamano?: Tamano;
}

export function BotonLink({ variante = 'primario', tamano = 'md', className = '', ...rest }: BotonLinkProps) {
  return <Link className={clasesBoton(variante, tamano, className)} {...rest} />;
}
