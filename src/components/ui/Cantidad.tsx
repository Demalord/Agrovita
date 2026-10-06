import { IconoMas, IconoMenos } from './Iconos';

export function Cantidad({ valor, onCambiar, max = 99, etiqueta = 'Cantidad' }: { valor: number; onCambiar: (n: number) => void; max?: number; etiqueta?: string }) {
  return (
    <div className="inline-flex h-12 items-center rounded-lg border border-[#b9b3a6] bg-white">
      <button type="button" className="grid h-full w-11 place-items-center rounded-l-lg hover:bg-fondo disabled:opacity-40" onClick={() => onCambiar(valor - 1)} disabled={valor <= 1} aria-label="Quitar uno">
        <IconoMenos size={18} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={valor}
        aria-label={etiqueta}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onCambiar(Math.min(max, Math.max(1, Math.round(n))));
        }}
        className="h-full w-12 border-x border-[#e2ded4] text-center text-base font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className="grid h-full w-11 place-items-center rounded-r-lg hover:bg-fondo disabled:opacity-40" onClick={() => onCambiar(valor + 1)} disabled={valor >= max} aria-label="Agregar uno">
        <IconoMas size={18} />
      </button>
    </div>
  );
}
