import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/producto/ProductCard';
import { Boton } from '../components/ui/Boton';
import { IconoCerrar } from '../components/ui/Iconos';
import { usePublicados, useVendedores } from '../hooks/useTienda';
import type { Especie } from '../types';
import { nombresCategoria, nombresEspecie } from '../utils/formato';

const POR_PAGINA = 9;
type Orden = 'relevancia' | 'menor' | 'mayor';

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const productos = usePublicados();
  const vendedores = useVendedores().filter((v) => v.estado === 'aprobado');

  const [especies, setEspecies] = useState<Especie[]>([]);
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [soloFormula, setSoloFormula] = useState(false);
  const [soloFrio, setSoloFrio] = useState(false);
  const [orden, setOrden] = useState<Orden>('relevancia');
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const min = Number(precioMin) || 0;
    const max = Number(precioMax) || Infinity;
    const r = productos.filter(
      (p) =>
        (!categoria || p.categoria === categoria) &&
        (!q || `${p.nombre} ${p.presentacion} ${p.descripcion}`.toLowerCase().includes(q)) &&
        (especies.length === 0 || p.especies.some((e) => especies.includes(e))) &&
        p.precio >= min &&
        p.precio <= max &&
        (!vendedor || p.vendedorId === vendedor) &&
        (!soloFormula || p.requiereFormula) &&
        (!soloFrio || p.requiereFrio),
    );
    if (orden === 'menor') r.sort((a, b) => a.precio - b.precio);
    if (orden === 'mayor') r.sort((a, b) => b.precio - a.precio);
    return r;
  }, [productos, categoria, q, especies, precioMin, precioMax, vendedor, soloFormula, soloFrio, orden]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  const titulo = q ? `Resultados para “${params.get('q')}”` : categoria ? nombresCategoria[categoria] : 'Todo el catálogo';

  function limpiar() {
    setEspecies([]);
    setPrecioMin('');
    setPrecioMax('');
    setVendedor('');
    setSoloFormula(false);
    setSoloFrio(false);
    setPagina(1);
  }

  const toggleEspecie = (e: Especie) => {
    setEspecies((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
    setPagina(1);
  };

  const filtros = (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-2 font-semibold">Especie</legend>
        {(Object.keys(nombresEspecie) as Especie[]).map((e) => (
          <label key={e} className="flex min-h-10 items-center gap-3 text-[15px]">
            <input type="checkbox" className="size-5 accent-primario" checked={especies.includes(e)} onChange={() => toggleEspecie(e)} />
            {nombresEspecie[e]}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-semibold">Precio (COP)</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="pmin" className="sr-only">Precio mínimo</label>
            <input id="pmin" inputMode="numeric" className="campo" placeholder="Mín." value={precioMin} onChange={(e) => { setPrecioMin(e.target.value.replace(/\D/g, '')); setPagina(1); }} />
          </div>
          <div>
            <label htmlFor="pmax" className="sr-only">Precio máximo</label>
            <input id="pmax" inputMode="numeric" className="campo" placeholder="Máx." value={precioMax} onChange={(e) => { setPrecioMax(e.target.value.replace(/\D/g, '')); setPagina(1); }} />
          </div>
        </div>
      </fieldset>
      <div>
        <label htmlFor="fvendedor" className="mb-2 block font-semibold">Vendedor</label>
        <select id="fvendedor" className="campo" value={vendedor} onChange={(e) => { setVendedor(e.target.value); setPagina(1); }}>
          <option value="">Todos</option>
          {vendedores.map((v) => <option key={v.id} value={v.id}>{v.razonSocial}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="mb-2 font-semibold">Condiciones</legend>
        <label className="flex min-h-10 items-center gap-3 text-[15px]">
          <input type="checkbox" className="size-5 accent-primario" checked={soloFormula} onChange={(e) => { setSoloFormula(e.target.checked); setPagina(1); }} />
          Requiere fórmula
        </label>
        <label className="flex min-h-10 items-center gap-3 text-[15px]">
          <input type="checkbox" className="size-5 accent-primario" checked={soloFrio} onChange={(e) => { setSoloFrio(e.target.checked); setPagina(1); }} />
          Cadena de frío
        </label>
      </fieldset>
      <Boton variante="secundario" onClick={limpiar}>Limpiar filtros</Boton>
    </div>
  );

  return (
    <div className="contenedor pt-6">
      <nav aria-label="Migas de pan" className="mb-2 text-sm text-texto-suave">
        <Link to="/" className="hover:underline">Inicio</Link> / <span>{titulo}</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl">{titulo}</h1>
        <span className="text-texto-suave">{filtrados.length} resultados</span>
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <aside className="md:w-64 md:shrink-0" aria-label="Filtros">
          <details className="tarjeta p-4 md:hidden">
            <summary className="min-h-10 cursor-pointer content-center font-semibold">Filtros</summary>
            <div className="pt-4">{filtros}</div>
          </details>
          <div className="tarjeta hidden p-5 md:block">{filtros}</div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {categoria && (
                <button type="button" onClick={() => { params.delete('categoria'); setParams(params); }} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-primario-suave px-3 text-sm font-semibold text-primario-oscuro">
                  {nombresCategoria[categoria]} <IconoCerrar size={14} />
                </button>
              )}
              {especies.map((e) => (
                <button key={e} type="button" onClick={() => toggleEspecie(e)} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-primario-suave px-3 text-sm font-semibold text-primario-oscuro">
                  {nombresEspecie[e]} <IconoCerrar size={14} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="orden" className="text-sm">Ordenar por</label>
              <select id="orden" className="campo w-44" value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
                <option value="relevancia">Relevancia</option>
                <option value="menor">Menor precio</option>
                <option value="mayor">Mayor precio</option>
              </select>
            </div>
          </div>

          {visibles.length === 0 ? (
            <div className="tarjeta flex flex-col items-center gap-3 p-10 text-center">
              <p className="text-lg font-semibold">No encontramos productos con esos filtros.</p>
              <Boton variante="secundario" onClick={limpiar}>Limpiar filtros</Boton>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {visibles.map((p) => <ProductCard key={p.id} producto={p} />)}
            </div>
          )}

          {paginas > 1 && (
            <nav aria-label="Paginación" className="mt-8 flex flex-wrap justify-center gap-2">
              <Boton variante="secundario" tamano="sm" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</Boton>
              {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
                <Boton key={n} variante={n === paginaActual ? 'primario' : 'secundario'} tamano="sm" aria-current={n === paginaActual ? 'page' : undefined} onClick={() => setPagina(n)}>
                  {n}
                </Boton>
              ))}
              <Boton variante="secundario" tamano="sm" disabled={paginaActual === paginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</Boton>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
