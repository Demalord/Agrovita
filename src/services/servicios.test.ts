import { describe, expect, it } from 'vitest';
import { consultarRegistro } from './ica';
import { cotizar, RECARGO_FRIO, buscarMunicipio } from './envio';
import { diasHabilesRestantes, esDiaHabil, fechaLimite } from './retracto';
import { validarFechaFormula } from './formula';
import productos from '../data/productos.json';
import type { Producto } from '../types';

const lista = productos as Producto[];
const p = (id: string) => lista.find((x) => x.id === id)!;

describe('icaService', () => {
  it('reconoce un registro vigente', () => {
    expect(consultarRegistro('ICA-DEMO-0001', '2026-10-06').estado).toBe('vigente');
  });
  it('detecta un registro vencido', () => {
    expect(consultarRegistro('ICA-DEMO-0019', '2026-10-06').estado).toBe('vencido');
  });
  it('detecta un número falso', () => {
    expect(consultarRegistro('ICA-FALSO-777').estado).toBe('no-existe');
  });
  it('ignora mayúsculas y espacios', () => {
    expect(consultarRegistro('  ica-demo-0001 ', '2026-10-06').estado).toBe('vigente');
  });
});

describe('envioService', () => {
  it('suma tarifa base + tarifa por kg', () => {
    const ubate = buscarMunicipio('ubate')!;
    const c = cotizar('ubate', [{ producto: p('p01'), cantidad: 2 }]);
    expect(c.total).toBe(ubate.tarifaBase + 80 * ubate.tarifaKg);
  });
  it('agrega recargo de frío a la vacuna', () => {
    const vacuna = p('p16');
    const sin = cotizar('ubate', [{ producto: { ...vacuna, requiereFrio: false }, cantidad: 1 }]).total;
    const con = cotizar('ubate', [{ producto: vacuna, cantidad: 1 }]).total;
    expect(con - sin).toBe(RECARGO_FRIO);
  });
  it('cotiza un envío por vendedor', () => {
    const c = cotizar('ubate', [
      { producto: p('p01'), cantidad: 1 },
      { producto: p('p16'), cantidad: 1 },
    ]);
    expect(c.grupos).toHaveLength(2);
  });
  it('cambia el precio según el municipio', () => {
    const a = cotizar('zipaquira', [{ producto: p('p01'), cantidad: 1 }]).total;
    const b = cotizar('sogamoso', [{ producto: p('p01'), cantidad: 1 }]).total;
    expect(b).toBeGreaterThan(a);
  });
});

describe('retractoService', () => {
  it('sábados, domingos y festivos no son hábiles', () => {
    expect(esDiaHabil('2026-10-10')).toBe(false); // sábado
    expect(esDiaHabil('2026-10-12')).toBe(false); // festivo
    expect(esDiaHabil('2026-10-13')).toBe(true);
  });
  it('quedan 5 días el mismo día de la entrega', () => {
    expect(diasHabilesRestantes('2026-10-06', '2026-10-06')).toBe(5);
  });
  it('salta el fin de semana y el festivo', () => {
    // Entrega viernes 9; lunes 12 es festivo → el martes 13 es el primer día hábil
    expect(diasHabilesRestantes('2026-10-09', '2026-10-13')).toBe(4);
    expect(fechaLimite('2026-10-09')).toBe('2026-10-19');
  });
  it('vence después de 5 días hábiles', () => {
    expect(diasHabilesRestantes('2026-09-01', '2026-10-06')).toBe(0);
  });
});

describe('fórmula veterinaria', () => {
  it('acepta 30 días', () => {
    expect(validarFechaFormula('2026-09-06', '2026-10-06').valida).toBe(true);
  });
  it('rechaza 31 días o más', () => {
    expect(validarFechaFormula('2026-09-05', '2026-10-06').valida).toBe(false);
  });
  it('rechaza fechas futuras', () => {
    expect(validarFechaFormula('2026-10-07', '2026-10-06').valida).toBe(false);
  });
});
