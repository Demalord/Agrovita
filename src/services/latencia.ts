/** Simula la latencia de red de un servicio externo. En pruebas no espera. */
export function esperar(ms: number): Promise<void> {
  if (import.meta.env?.MODE === 'test') return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
