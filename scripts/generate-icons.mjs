// Gera src/shared/components/icon.config.js: o miolo do <svg> (viewBox 24x24) de cada ícone usado.
//
//   npm run icons      (roda sozinho antes de `npm run dev`)
//
// Os nomes vêm do próprio código, sem lista manual:
//   - index.html: data-icon="nome" (e href="#i-nome" escrito à mão);
//   - src/**/*.js: todo literal entre aspas que seja nome de ícone do lucide ('copy', "x"…).
// O config é refeito do zero a cada execução: ícone que deixou de ser usado sai sozinho.
// O lucide é só devDependency e este é o único arquivo que o importa: nada dele entra no bundle.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { icons } from 'lucide';

const ROOT = new URL('../', import.meta.url);
const HTML_FILE = new URL('index.html', ROOT);
const SOURCE_DIR = new URL('src/', ROOT);
const OUTPUT_FILE = new URL('src/shared/components/icon.config.js', ROOT);
const OUTPUT_NAME = 'icon.config.js';
const HTML_ICON = /(?:data-icon="|href="#i-)([a-z0-9-]+)"/g;
const JS_LITERAL = /(['"`])([a-z0-9]+(?:-[a-z0-9]+)*)\1/g;

const toPascalCase = (name) => name.replace(/(?:^|-)(\w)/g, (_, letter) => letter.toUpperCase());
const toKebabCase = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const exists = (name) => Boolean(icons[toPascalCase(name)]);

const renderNode = ([tag, attributes]) => {
  const list = Object.entries(attributes).filter(([name]) => name !== 'key');
  return `<${tag} ${list.map(([name, value]) => `${name}="${value}"`).join(' ')}/>`;
};

// Nomes do lucide que compartilham alguma palavra com o nome pedido (mais palavras em comum primeiro).
const suggest = (name) => {
  const words = name.split('-').filter((word) => word.length > 1);
  const score = (candidate) => words.filter((word) => candidate.split('-').includes(word)).length;
  return Object.keys(icons)
    .map(toKebabCase)
    .filter((candidate) => score(candidate) > 0)
    .sort((a, b) => score(b) - score(a) || a.localeCompare(b))
    .slice(0, 8);
};

const namesFromHtml = () => [...readFileSync(HTML_FILE, 'utf8').matchAll(HTML_ICON)].map(([, name]) => name);

const namesFromSource = () =>
  readdirSync(SOURCE_DIR, { recursive: true })
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => file.endsWith('.js') && !file.endsWith(OUTPUT_NAME))
    .flatMap((file) => [...readFileSync(new URL(file, SOURCE_DIR), 'utf8').matchAll(JS_LITERAL)].map(([, , name]) => name))
    .filter(exists);

const readCurrent = async () => {
  try {
    return Object.keys((await import(OUTPUT_FILE.href)).ICONS);
  } catch {
    return [];
  }
};

const quote = (text) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const buildSource = (entries) => [
  '// GERADO por scripts/generate-icons.mjs: não edite à mão (npm run icons).',
  '// Cada valor é o miolo do <svg> (viewBox 24x24) do ícone de mesmo nome no lucide.',
  'const ICONS = {',
  ...entries.map(([name, body]) => `  ${quote(name)}: ${quote(body)},`),
  '};',
  '',
  'export { ICONS };',
  '',
].join('\n');

const current = await readCurrent();
const fromHtml = namesFromHtml();
const missing = [...new Set(fromHtml.filter((name) => !exists(name)))];

if (missing.length) {
  console.error(`Ícones não encontrados no lucide: ${missing.join(', ')}`);
  missing.forEach((name) => {
    const options = suggest(name);
    if (options.length) console.error(`  ${name} → parecidos: ${options.join(', ')}`);
  });
  process.exit(1);
}

const names = [...new Set([...fromHtml, ...namesFromSource()])].sort();
const entries = names.map((name) => [name, icons[toPascalCase(name)].map(renderNode).join('')]);
const added = names.filter((name) => !current.includes(name));
const removed = current.filter((name) => !names.includes(name));
const notes = [added.length && `novos: ${added.join(', ')}`, removed.length && `removidos: ${removed.join(', ')}`].filter(Boolean);

writeFileSync(OUTPUT_FILE, buildSource(entries));
console.log(`${names.length} ícone(s) em ${OUTPUT_NAME}${notes.length ? ` (${notes.join('; ')})` : ''}`);
