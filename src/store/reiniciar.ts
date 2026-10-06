/** Borra el estado guardado en localStorage y recarga con los datos de ejemplo. */
export function reiniciarDemo(): void {
  try {
    ['agrovita-catalogo', 'agrovita-sesion', 'agrovita-carrito', 'agrovita-pedidos'].forEach((k) => localStorage.removeItem(k));
  } catch {
    /* almacenamiento no disponible */
  }
  window.location.assign('/');
}
