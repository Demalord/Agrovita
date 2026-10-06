/** Resuelve una ruta de /public respetando la base del build ("/" en local, "./" en la versión publicada). */
export function asset(ruta: string): string {
  return `${import.meta.env.BASE_URL}${ruta.replace(/^\//, '')}`;
}
