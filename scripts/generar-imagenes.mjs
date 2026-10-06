// Genera ilustraciones SVG sencillas para los productos de ejemplo.
// Uso: node scripts/generar-imagenes.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const salida = join(raiz, 'public', 'img', 'productos');
mkdirSync(salida, { recursive: true });

const marco = (fondo, contenido) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img"><rect width="400" height="400" fill="${fondo}"/><ellipse cx="200" cy="338" rx="120" ry="14" fill="#000" opacity=".08"/>${contenido}</svg>\n`;

const bulto = (color, etiqueta, texto) =>
  `<path d="M112 92q88-24 176 0l14 236q-102 18-204 0z" fill="#f4efe3" stroke="#c9bfa8" stroke-width="3"/>` +
  `<path d="M112 92q88-24 176 0" fill="none" stroke="#b5a98d" stroke-width="5" stroke-dasharray="6 6"/>` +
  `<rect x="128" y="150" width="144" height="120" rx="10" fill="${color}"/>` +
  `<text x="200" y="198" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#fff">${etiqueta}</text>` +
  `<text x="200" y="232" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#fff" opacity=".9">${texto}</text>` +
  `<text x="200" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#7a6f57">40 kg</text>`;

const bloque = (color) =>
  `<path d="M100 190l100-50 100 50v110l-100 40-100-40z" fill="${color}"/>` +
  `<path d="M100 190l100-50 100 50-100 45z" fill="#fff" opacity=".35"/>` +
  `<path d="M200 235v105" stroke="#000" opacity=".12" stroke-width="3"/>` +
  `<circle cx="160" cy="180" r="10" fill="#fff" opacity=".5"/><circle cx="235" cy="172" r="7" fill="#fff" opacity=".5"/>`;

const bolsa = (color) =>
  `<path d="M130 110h140l18 220H112z" fill="#fff" stroke="#c9bfa8" stroke-width="3"/>` +
  `<rect x="130" y="90" width="140" height="26" rx="6" fill="${color}"/>` +
  `<rect x="146" y="170" width="108" height="90" rx="10" fill="${color}"/>` +
  `<text x="200" y="222" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#fff">SAL</text>`;

const tanque = (color) =>
  `<rect x="70" y="170" width="260" height="150" rx="24" fill="${color}"/>` +
  `<rect x="70" y="170" width="260" height="34" rx="17" fill="#fff" opacity=".3"/>` +
  `<path d="M96 214q104 22 208 0" fill="none" stroke="#fff" stroke-width="4" opacity=".5"/>` +
  `<rect x="290" y="130" width="16" height="50" rx="6" fill="#5b6472"/><circle cx="298" cy="128" r="12" fill="#f2a900"/>`;

const caja = (color) =>
  `<rect x="110" y="120" width="180" height="200" rx="16" fill="${color}"/>` +
  `<rect x="136" y="150" width="128" height="60" rx="8" fill="#0f2b12"/>` +
  `<path d="M150 182h20l10-18 14 34 12-22 10 6h28" fill="none" stroke="#9be09f" stroke-width="4" stroke-linejoin="round"/>` +
  `<circle cx="160" cy="260" r="16" fill="#f2a900"/><circle cx="240" cy="260" r="16" fill="#fff"/>` +
  `<path d="M200 120V84m-30 10l30-10 30 10" stroke="#5b6472" stroke-width="6" fill="none" stroke-linecap="round"/>`;

const comedero = (color) =>
  `<path d="M200 70v40" stroke="#5b6472" stroke-width="5"/>` +
  `<path d="M160 110h80l20 150H140z" fill="${color}"/>` +
  `<path d="M160 110h80l6 40h-92z" fill="#fff" opacity=".3"/>` +
  `<ellipse cx="200" cy="290" rx="110" ry="30" fill="${color}"/><ellipse cx="200" cy="282" rx="86" ry="18" fill="#e9c46a"/>`;

const frasco = (color, etiqueta) =>
  `<rect x="168" y="70" width="64" height="40" rx="6" fill="#5b6472"/>` +
  `<path d="M150 110h100q20 0 20 24v176q0 18-20 18H150q-20 0-20-18V134q0-24 20-24z" fill="#fff" stroke="#c9bfa8" stroke-width="3"/>` +
  `<rect x="130" y="170" width="140" height="110" fill="${color}"/>` +
  `<text x="200" y="232" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#fff">${etiqueta}</text>`;

const vial = (color) =>
  `<rect x="172" y="80" width="56" height="36" rx="6" fill="${color}"/>` +
  `<rect x="164" y="112" width="72" height="16" rx="4" fill="#aeb4bd"/>` +
  `<path d="M160 128h80v176q0 22-22 22h-36q-22 0-22-22z" fill="#e3f2fb" stroke="#9cc3dc" stroke-width="3"/>` +
  `<rect x="160" y="200" width="80" height="70" fill="${color}"/>` +
  `<path d="M288 120v70m-30-35h60m-50-25l40 50m0-50l-40 50" stroke="#0277bd" stroke-width="6" stroke-linecap="round"/>`;

const termo = (color) =>
  `<rect x="100" y="150" width="200" height="170" rx="18" fill="${color}"/>` +
  `<rect x="90" y="130" width="220" height="40" rx="14" fill="#fff" stroke="${color}" stroke-width="6"/>` +
  `<path d="M160 130v-30h80v30" fill="none" stroke="#5b6472" stroke-width="8" stroke-linecap="round"/>` +
  `<path d="M200 210v60m-26-30h52m-44-22l36 44m0-44l-36 44" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;

const jeringa = (color) =>
  `<g transform="rotate(-30 200 210)"><rect x="110" y="190" width="170" height="44" rx="10" fill="#fff" stroke="#9aa1ab" stroke-width="3"/>` +
  `<rect x="120" y="198" width="110" height="28" rx="4" fill="${color}" opacity=".6"/>` +
  `<rect x="280" y="204" width="40" height="16" fill="#9aa1ab"/><path d="M320 212h40" stroke="#5b6472" stroke-width="4"/>` +
  `<rect x="60" y="180" width="50" height="64" rx="8" fill="#5b6472"/></g>`;

const imagenes = {
  p01: ['#fbf6ea', bulto('#2f7d32', 'LECHERO', '18 % proteína')],
  p02: ['#fbf6ea', bulto('#558b2f', 'LEVANTE', 'terneras')],
  p03: ['#fbf6ea', bulto('#8d6e63', 'CEBA', 'bovina')],
  p04: ['#fbf6ea', bulto('#c77d00', 'ENERGÍA', 'con melaza')],
  p05: ['#fbf6ea', bulto('#e07a1f', 'POLLO', 'engorde')],
  p06: ['#fbf6ea', bulto('#c2185b', 'PORCINO', 'inicio')],
  p07: ['#eef4f8', bolsa('#1b5e20')],
  p08: ['#eef4f8', bolsa('#2e7d6b')],
  p09: ['#f6f1e6', bloque('#a1673a')],
  p10: ['#eef4f8', bolsa('#6d4c41')],
  p11: ['#eaf3fb', tanque('#1e6fb0')],
  p12: ['#eef2ee', caja('#2f7d32')],
  p13: ['#fbf6ea', comedero('#d84315')],
  p14: ['#fdf2f2', frasco('#c62828', 'Rx')],
  p15: ['#fdf2f2', frasco('#ad1457', 'Rx')],
  p16: ['#eaf4fb', vial('#0277bd')],
  p17: ['#eaf4fb', vial('#00838f')],
  p18: ['#eaf4fb', termo('#0277bd')],
  p19: ['#f3f1ec', frasco('#6d4c41', 'ORAL')],
  p20: ['#f0f2f4', jeringa('#2f7d32')],
  nuevo: ['#f0f2f4', bolsa('#5b6472')],
};

for (const [id, [fondo, contenido]] of Object.entries(imagenes)) {
  writeFileSync(join(salida, `${id}.svg`), marco(fondo, contenido));
}

// Ilustración del banner principal
const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" role="img"><rect width="640" height="440" fill="#dff0e0"/><circle cx="520" cy="90" r="44" fill="#f2a900"/><path d="M0 300q160-90 320-30t320-40v210H0z" fill="#8bc48e"/><path d="M0 340q200-60 400 0t240-20v120H0z" fill="#2f7d32"/><g fill="#fff" stroke="#1f2933" stroke-width="4"><path d="M120 300h120q20 0 24-20l6-40q2-12-10-12H150q-30 0-40 30z"/><path d="M262 232l26-16 10 12-16 18"/></g><g fill="#1f2933"><circle cx="160" cy="262" r="10"/><circle cx="214" cy="270" r="12"/><rect x="130" y="300" width="10" height="34" rx="4"/><rect x="226" y="300" width="10" height="34" rx="4"/></g><rect x="420" y="220" width="120" height="110" fill="#f4efe3" stroke="#1f2933" stroke-width="4"/><path d="M410 224l70-50 70 50" fill="#c62828" stroke="#1f2933" stroke-width="4" stroke-linejoin="round"/><rect x="465" y="270" width="30" height="60" fill="#8d6e63"/></svg>\n`;
mkdirSync(join(raiz, 'public', 'img'), { recursive: true });
writeFileSync(join(raiz, 'public', 'img', 'hero.svg'), hero);
console.log(`Imágenes generadas en ${salida}`);
