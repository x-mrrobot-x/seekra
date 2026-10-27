import * as storage from './storage.js';
import * as i18n from './i18n.js';
import * as router from './router.js';
import * as modalManager from './modal-manager.js';
import { emit } from './event-bus.js';
import * as toast from '../shared/components/toast.js';
import * as search from '../features/search/search.controller.js';
import * as ai from '../features/ai/ai.controller.js';
import * as results from '../features/results/results.controller.js';
import * as explorer from '../features/explorer/explorer.controller.js';
import * as saved from '../features/saved/saved.controller.js';
import * as settings from '../features/settings/settings.controller.js';
import * as fileSheet from '../features/file-sheet/file-sheet.controller.js';

const LAYOUT_DELAY = 80;
const FONT_TIMEOUT = 1500;

const FONTS = [
  '400 1em "Space Grotesk"',
  '500 1em "Space Grotesk"',
  '600 1em "Space Grotesk"',
  '700 1em "Space Grotesk"',
  '400 1em "JetBrains Mono"',
  '500 1em "JetBrains Mono"',
];

const initChain = [
  router.init,
  modalManager.init,
  toast.init,
  search.init,
  ai.init,
  results.init,
  explorer.init,
  saved.init,
  settings.init,
  fileSheet.init,
];

const applyStoredLanguage = () => {
  const language = storage.get('language', i18n.getLanguage());
  if (language !== i18n.getLanguage()) i18n.init(language);
};

const bindGlobalEvents = () => {
  window.addEventListener('resize', () => emit('layout:refresh'));
};

const restoreStoredSettings = () => {
  const language = storage.get('language', i18n.getLanguage());
  if (language !== i18n.getLanguage()) i18n.setLanguage(language);
  emit('storage:ready');
};

// Cada carga é independente: todas entram na fila no mesmo instante, rodam em paralelo
// e cada uma atualiza só a sua parte da tela quando termina.
const loadInitialData = () => {
  explorer.restoreVolumes();
  storage.init().then(restoreStoredSettings);
  explorer.loadVolumes();
};

const waitForFonts = () =>
  Promise.race([
    Promise.allSettled(FONTS.map((font) => document.fonts.load(font))),
    new Promise((resolve) => setTimeout(resolve, FONT_TIMEOUT)),
  ]);

const reveal = () => {
  emit('layout:refresh');
  void document.body.offsetWidth;
  document.documentElement.classList.remove('booting');
};

const init = () => {
  waitForFonts().then(reveal);
  applyStoredLanguage();
  initChain.forEach((step) => step());
  i18n.applyTranslations();
  bindGlobalEvents();
  setTimeout(() => emit('layout:refresh'), LAYOUT_DELAY);
  loadInitialData();
};

export { init };
