import { Link } from 'react-router-dom';

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="AgroVita, inicio">
      <svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={claro ? '#ffffff' : '#2F7D32'} />
        <path d="M9 22c0-7 5-12 14-12-1 8-6 13-13 13" fill="none" stroke={claro ? '#2F7D32' : '#ffffff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 23l7-7" stroke="#F2A900" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className={`text-xl font-bold tracking-tight ${claro ? 'text-white' : 'text-primario-oscuro'}`}>
        Agro<span className={claro ? 'text-acento' : 'text-primario'}>Vita</span>
      </span>
    </Link>
  );
}
