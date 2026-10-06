# AgroVita

Prototipo de una tienda en línea de insumos agropecuarios (concentrados, sales mineralizadas, equipos, medicamentos y vacunas) que muestra el **precio final puesto en la finca** y solo vende productos y vendedores con **registro ICA**.

Proyecto de clase · Innovación y Emprendimiento · Universidad Agustiniana.

- **Prototipo funcionando:** https://demalord.github.io/Agrovita/ (GitHub Pages, rama `gh-pages`)
- **Wireframes y mockups (PDF):** [`docs/AgroVita-wireframes-mockups-prototipo.pdf`](docs/AgroVita-wireframes-mockups-prototipo.pdf)

## Correrlo en local

Requiere Node.js 20 o superior.

```bash
git clone https://github.com/Demalord/Agrovita.git
cd Agrovita
npm install
npm run dev      # http://localhost:5173
```

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `npm test` | Pruebas de los servicios (ICA, envío, retracto, fórmula) |
| `npm run build` | Revisa tipos y genera `dist/` |
| `npm run build:pages` | Genera `dist-pages/` con rutas `#/` para publicarla como página estática |
| `node scripts/generar-imagenes.mjs` | Regenera las ilustraciones SVG de los productos |

## Usuarios de prueba

Se entra desde **Ingresar** con un clic, sin contraseña.

| Rol | Usuario |
| --- | --- |
| Comprador | Carlos Rojas · Finca La Esperanza, Ubaté |
| Vendedor | AgroInsumos Sabana S.A.S. |
| Administrador | admin@agrovita.test |

Los datos se guardan en el `localStorage` del navegador. El enlace **Reiniciar datos de demostración** del pie de página los devuelve al estado inicial.

## Qué se puede probar

1. Cambiar **Entregar en** (municipio) y ver cómo cambia el total puesto en finca.
2. **Verificar registro** ICA desde la ficha de un producto.
3. Comprar un antibiótico: el checkout pide la **fórmula veterinaria** y bloquea el pago si tiene más de 30 días.
4. Comprar una vacuna: el envío es **refrigerado** y suma el recargo de cadena de frío.
5. Pagar **contra entrega**, por **PSE** o con **billetera digital** (pasarela simulada).
6. Solicitar el **retracto** dentro de los 5 días hábiles (descuenta fines de semana y festivos).
7. Como vendedor, publicar un producto: sin registro ICA vigente no se guarda (`ICA-DEMO-0019` está vencido, `ICA-DEMO-0021` está libre).
8. Como administrador, aprobar o rechazar vendedores, productos y fórmulas.

## Reglas del negocio

| Regla | Fuente | Implementación |
| --- | --- | --- |
| Vendedores y productos con registro ICA | ICA (2021, 2025) | `src/services/ica.ts` |
| Fórmula veterinaria de máximo 30 días | ICA (2021) | `src/services/formula.ts` |
| Cadena de frío en el envío | ICA (2021) | `src/services/envio.ts` |
| Precio total y costo de envío visibles | Ley 1480 de 2011 | `useResumenCarrito` en `src/hooks/useTienda.ts` |
| Retracto de 5 días hábiles | Ley 1480 de 2011 | `src/services/retracto.ts` |
| Pago contra entrega | DANE (2025) | `src/services/pago.ts` |

## Estructura

```
src/
├─ data/          productos, vendedores, registros ICA, municipios, festivos, usuarios (JSON)
├─ types/         modelo de datos
├─ services/      ica, envio, pago, retracto, formula (simulados) + pruebas
├─ store/         carrito, sesion, pedidos, catalogo (Zustand + localStorage)
├─ hooks/         consultas derivadas de la tienda
├─ components/    ui, layout, producto
└─ pages/         una página por pantalla (P01–P12)
```

**Stack:** Vite · React 18 · TypeScript · React Router · Tailwind CSS 4 · Zustand · React Hook Form · Zod · Vitest.

> Prototipo académico: los productos, precios, vendedores y números de registro ICA son de ejemplo. No se hacen pagos ni consultas reales al ICA.
