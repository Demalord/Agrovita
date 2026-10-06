import { IconoCheck } from './Iconos';

export function Stepper({ pasos, actual }: { pasos: string[]; actual: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Pasos del pago">
      {pasos.map((p, i) => {
        const hecho = i < actual;
        const activo = i === actual;
        return (
          <li key={p} className="flex items-center gap-3" aria-current={activo ? 'step' : undefined}>
            <span
              className={`grid size-8 place-items-center rounded-full text-sm font-bold ${
                activo ? 'bg-primario text-white' : hecho ? 'bg-primario-suave text-primario-oscuro' : 'border-2 border-[#c9c3b5] text-texto-suave'
              }`}
            >
              {hecho ? <IconoCheck size={16} /> : i + 1}
            </span>
            <span className={`text-sm font-semibold ${activo || hecho ? 'text-texto' : 'text-texto-suave'}`}>{p}</span>
            {i < pasos.length - 1 && <span className="hidden h-0.5 w-8 bg-borde sm:block" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
