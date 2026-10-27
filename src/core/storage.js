import { read, write } from '@env';
import * as localCache from '../shared/utils/local-cache.js';

const SETTINGS_FILE = 'settings.json';
const READ_TIMEOUT = 8000;
const WRITE_DELAY = 250;
const MIRROR_KEY = 'seekra_preferences';
const MIRRORED_KEYS = ['theme', 'language'];

const readMirror = () => {
  const stored = localCache.read(MIRROR_KEY) || {};
  return Object.fromEntries(MIRRORED_KEYS.filter((key) => typeof stored[key] === 'string').map((key) => [key, stored[key]]));
};

const syncMirror = (source) => {
  const next = { ...mirror };
  MIRRORED_KEYS.filter((key) => typeof source[key] === 'string').forEach((key) => {
    next[key] = source[key];
  });
  mirror = next;
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
