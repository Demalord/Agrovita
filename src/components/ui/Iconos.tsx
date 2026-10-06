import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconoBuscar = (p: P) => (
  <Base {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Base>
);
export const IconoCarrito = (p: P) => (
  <Base {...p}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" /></Base>
);
export const IconoUsuario = (p: P) => (
  <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Base>
);
export const IconoUbicacion = (p: P) => (
  <Base {...p}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></Base>
);
export const IconoEscudo = (p: P) => (
  <Base {...p}><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Base>
);
export const IconoFrio = (p: P) => (
  <Base {...p}><path d="M12 2v20M4 6l16 12M20 6 4 18" /><path d="m9 3 3 2 3-2M9 21l3-2 3 2" /></Base>
);
export const IconoReceta = (p: P) => (
  <Base {...p}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 11v6m0-6h2.5a1.8 1.8 0 0 1 0 3.6H10m2.5 0 2.5 2.4" /></Base>
);
export const IconoCamion = (p: P) => (
  <Base {...p}><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></Base>
);
export const IconoBillete = (p: P) => (
  <Base {...p}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10v4M18 10v4" /></Base>
);
export const IconoBanco = (p: P) => (
  <Base {...p}><path d="m3 9 9-5 9 5M5 10v7M10 10v7M14 10v7M19 10v7M3 20h18" /></Base>
);
export const IconoCelular = (p: P) => (
  <Base {...p}><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></Base>
);
export const IconoCheck = (p: P) => (
  <Base {...p}><path d="m5 12 5 5 9-10" /></Base>
);
export const IconoMas = (p: P) => (
  <Base {...p}><path d="M12 5v14M5 12h14" /></Base>
);
export const IconoMenos = (p: P) => (
  <Base {...p}><path d="M5 12h14" /></Base>
);
export const IconoBasura = (p: P) => (
  <Base {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Base>
);
export const IconoFlecha = (p: P) => (
  <Base {...p}><path d="M5 12h14m-5-5 5 5-5 5" /></Base>
);
export const IconoAtras = (p: P) => (
  <Base {...p}><path d="M19 12H5m5-5-5 5 5 5" /></Base>
);
export const IconoCasa = (p: P) => (
  <Base {...p}><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Base>
);
export const IconoCuadricula = (p: P) => (
  <Base {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Base>
);
export const IconoCerrar = (p: P) => (
  <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>
);
export const IconoAlerta = (p: P) => (
  <Base {...p}><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></Base>
);
export const IconoInfo = (p: P) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Base>
);
export const IconoSubir = (p: P) => (
  <Base {...p}><path d="M12 16V4m-5 5 5-5 5 5M4 20h16" /></Base>
);
export const IconoEstrella = (p: P) => (
  <Base {...p} fill="currentColor" stroke="none"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></Base>
);
export const IconoHoja = (p: P) => (
  <Base {...p}><path d="M5 19c0-8 5-13 15-14-1 9-6 15-14 14" /><path d="m5 19 7-7" /></Base>
);
export const IconoPaquete = (p: P) => (
  <Base {...p}><path d="m12 3 8 4v10l-8 4-8-4V7z" /><path d="m4 7 8 4 8-4M12 11v10" /></Base>
);
export const IconoGrafico = (p: P) => (
  <Base {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Base>
);
export const IconoSalir = (p: P) => (
  <Base {...p}><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></Base>
);
