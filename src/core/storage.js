import { read, write } from '@env';
import * as localCache from '../shared/utils/local-cache.js';

const SETTINGS_FILE = 'settings.json';
const READ_TIMEOUT = 8000;
const WRITE_DELAY = 250;
const MIRROR_KEY = 'seekra_preferences';

const isText = (value) => typeof value === 'string';
const isTextList = (value) => Array.isArray(value) && value.every(isText);

// Chaves espelhadas em localStorage para o primeiro paint, cada uma com o seu validador.
const MIRRORED = { theme: isText, language: isText, favorites: isTextList };
const MIRRORED_KEYS = Object.keys(MIRRORED);

const pickMirrored = (source) =>
  Object.fromEntries(MIRRORED_KEYS.filter((key) => MIRRORED[key](source[key])).map((key) => [key, source[key]]));

const readMirror = () => pickMirrored(localCache.read(MIRROR_KEY) || {});

const syncMirror = (source) => {
  mirror = { ...mirror, ...pickMirrored(source) };
  localCache.write(MIRROR_KEY, mirror);
};

let mirror = readMirror();
let cache = {};
let timer = null;
let ready = Promise.resolve();

const load = async () => {
  try {
    const stored = JSON.parse((await read(SETTINGS_FILE, { timeout: READ_TIMEOUT })) || '{}');
    cache = { ...stored, ...cache };
    syncMirror(cache);
  } catch {
    // sem arquivo ou leitura falhou: segue só com o que já está em memória
  }
};

const init = () => {
  ready = load();
  return ready;
};

const flush = async () => {
  await ready;
  write(SETTINGS_FILE, JSON.stringify(cache)).catch(() => {});
};

const get = (key, fallback) => cache[key] ?? mirror[key] ?? fallback;

const set = (key, value) => {
  cache[key] = value;
  if (MIRRORED_KEYS.includes(key)) syncMirror(cache);
  clearTimeout(timer);
  timer = setTimeout(flush, WRITE_DELAY);
};

export { init, get, set };
