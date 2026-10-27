import { qs } from '../utils/dom.js';

// Os ícones vivem no sprite que o build injeta no index.html (scripts/icon-sprite.plugin.js),
// com id "i-<nome>". Aqui só se aponta para eles; o gerador acha o nome sozinho se ele for um literal.
const spriteId = (name) => `i-${name}`;

const warnIfMissing = (name) => {
  if (import.meta.env.DEV && !document.getElementById(spriteId(name))) {
    console.warn(`[icon] "${name}" não está no sprite. Escreva o nome como literal e rode: npm run icons`);
  }
};

const icon = (name, size = 'icon-md') => {
  warnIfMissing(name);
  return `<svg class="${size}" aria-hidden="true"><use href="#${spriteId(name)}"/></svg>`;
};

// Troca o ícone de um slot do HTML (<i data-icon-slot data-icon="..."> no fonte, <svg data-icon-slot> no build).
const setIcon = (container, name) => {
  warnIfMissing(name);
  qs('[data-icon-slot] use', container).setAttribute('href', `#${spriteId(name)}`);
};

export { icon, setIcon };
