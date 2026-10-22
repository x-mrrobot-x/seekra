import { read, write } from '@env';

const SETTINGS_FILE = 'settings.json';
const READ_TIMEOUT = 8000;
const WRITE_DELAY = 250;

let cache = {};
let timer = null;

const init = async () => {
  try {
    cache = JSON.parse((await read(SETTINGS_FILE, { timeout: READ_TIMEOUT })) || '{}');
  } catch {
    cache = {};
  }
};

const flush = () => write(SETTINGS_FILE, JSON.stringify(cache)).catch(() => {});

const get = (key, fallback) => cache[key] ?? fallback;

const set = (key, value) => {
  cache[key] = value;
  clearTimeout(timer);
  timer = setTimeout(flush, WRITE_DELAY);
};

export { init, get, set };
