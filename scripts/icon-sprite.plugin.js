// Plugin do Vite, no index.html:
//  1. expande <i data-icon="nome" class="…"></i> em <svg class="…" aria-hidden="true"><use href="#i-nome"/></svg>
//     (os demais atributos, como data-icon-slot, passam adiante);
//  2. troca o marcador <!-- icon-sprite --> pelo sprite (um <symbol> por ícone de ICONS);
//  3. confere se todo ícone referenciado existe no sprite.
// Roda no dev e no build, então o primeiro paint já tem os ícones, sem esperar JS.
import { ICONS } from '../src/shared/components/icon.config.js';

const MARKER = '<!-- icon-sprite -->';
const TAG = /<i\s+([^>]*\bdata-icon="([^"]*)"[^>]*)>\s*<\/i\s*>/g;
const ATTRIBUTE = /([\w-]+)(?:="([^"]*)")?/g;
const USED = /href="#i-([a-z0-9-]+)"/g;
const SYMBOL_ATTRIBUTES = 'viewBox="0 0 24 24" style="fill:var(--icon-fill,none)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const SPRITE_STYLE = 'position:absolute;width:0;height:0;overflow:hidden';

const buildSprite = () => {
  const symbols = Object.entries(ICONS)
    .map(([name, body]) => `<symbol id="i-${name}" ${SYMBOL_ATTRIBUTES}>${body}</symbol>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="${SPRITE_STYLE}">${symbols}</svg>`;
};

const expandIcon = (source, name) => {
  const attributes = [...source.matchAll(ATTRIBUTE)].filter(([, key]) => key !== 'data-icon');
  const className = attributes.find(([, key]) => key === 'class')?.[2];
  const rest = attributes
    .filter(([, key]) => key !== 'class')
    .map(([, key, value]) => (value === undefined ? key : `${key}="${value}"`));
  const list = [...(className ? [`class="${className}"`] : []), ...rest, 'aria-hidden="true"'];
  return `<svg ${list.join(' ')}><use href="#i-${name}"/></svg>`;
};

const transform = (source) => {
  if (!source.includes(MARKER)) throw new Error(`icon-sprite: faltou ${MARKER} no index.html`);
  const html = source.replace(TAG, (_, attributes, name) => expandIcon(attributes, name));
  const missing = [...new Set([...html.matchAll(USED)].map(([, name]) => name))].filter((name) => !(name in ICONS));
  if (missing.length) throw new Error(`icon-sprite: ícone(s) fora do sprite: ${missing.join(', ')}. Rode: npm run icons`);
  return html.replace(MARKER, () => buildSprite());
};

const iconSprite = () => ({
  name: 'icon-sprite',
  transformIndexHtml: { order: 'pre', handler: transform },
});

export { iconSprite, transform };
