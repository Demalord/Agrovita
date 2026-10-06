import { useEffect, useRef, type ReactNode } from 'react';
import { IconoCerrar } from './Iconos';

export function Modal({ abierto, titulo, onCerrar, children, cerrable = true }: { abierto: boolean; titulo: string; onCerrar: () => void; children: ReactNode; cerrable?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-label={titulo}
      onCancel={(e) => {
        e.preventDefault();
        if (cerrable) onCerrar();
      }}
      className="m-auto w-[min(520px,calc(100vw-32px))] rounded-xl border border-borde bg-white p-0 text-texto shadow-xl backdrop:bg-black/40"
    >
      <div className="flex items-center justify-between border-b border-borde px-5 py-4">
        <h2 className="text-lg">{titulo}</h2>
        {cerrable && (
          <button type="button" onClick={onCerrar} className="grid size-10 place-items-center rounded-lg hover:bg-fondo" aria-label="Cerrar">
            <IconoCerrar />
          </button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
