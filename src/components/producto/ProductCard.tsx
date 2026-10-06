import { asset } from '../../utils/asset';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Producto } from '../../types';
import { formatoCOP } from '../../utils/formato';
import { estimarProducto } from '../../services/envio';
import { useCarrito } from '../../store/carrito';
import { useSesion } from '../../store/sesion';
import { Boton } from '../ui/Boton';
import { ChipFormula, ChipFrio, ChipIca } from '../ui/Chip';
import { IconoCarrito, IconoCheck } from '../ui/Iconos';

export function EtiquetasProducto({ producto }: { producto: Producto }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <ChipIca />
      {producto.requiereFormula && <ChipFormula />}
      {producto.requiereFrio && <ChipFrio />}
    </div>
  );
}

export function ProductCard({ producto }: { producto: Producto }) {
  const agregar = useCarrito((s) => s.agregar);
  const municipioId = useSesion((s) => s.ubicacion.municipioId);
  const [agregado, setAgregado] = useState(false);
  const total = producto.precio + estimarProducto(municipioId, producto, 1);

  return (
    <article className="tarjeta flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/producto/${producto.id}`} className="block aspect-square bg-[#f3f1ea]">
        <img src={asset(producto.imagenes[0])} alt={producto.nombre} className="size-full object-cover" loading="lazy" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <EtiquetasProducto producto={producto} />
        <Link to={`/producto/${producto.id}`} className="font-semibold leading-snug hover:text-primario-oscuro hover:underline">
          {producto.nombre}
        </Link>
        <p className="text-sm text-texto-suave">{producto.presentacion}</p>
        <p className="text-sm text-texto-suave">Precio: {formatoCOP(producto.precio)}</p>
        <p className="rounded-md bg-acento-suave px-2.5 py-1.5 text-[15px]">
          <span className="text-sm">Total en tu finca: </span>
          <strong className="text-lg">{formatoCOP(total)}</strong>
        </p>
        <Boton
          className="mt-auto"
          variante={agregado ? 'secundario' : 'primario'}
          onClick={() => {
            agregar(producto.id, 1);
            setAgregado(true);
            setTimeout(() => setAgregado(false), 1500);
          }}
          disabled={producto.stock === 0}
        >
          {agregado ? <IconoCheck size={18} /> : <IconoCarrito size={18} />}
          {producto.stock === 0 ? 'Agotado' : agregado ? 'Agregado' : 'Agregar'}
        </Boton>
      </div>
    </article>
  );
}
