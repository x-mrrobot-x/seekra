import * as storage from './storage.js';
import * as i18n from './i18n.js';
import * as router from './router.js';
import * as modalManager from './modal-manager.js';
import { emit } from './event-bus.js';
import { refreshIcons } from '../shared/components/icon.js';
import * as toast from '../shared/components/toast.js';
import * as search from '../features/search/search.controller.js';
import * as ai from '../features/ai/ai.controller.js';
import * as results from '../features/results/results.controller.js';
import * as explorer from '../features/explorer/explorer.controller.js';
import * as saved from '../features/saved/saved.controller.js';
import * as settings from '../features/settings/settings.controller.js';
import * as fileSheet from '../features/file-sheet/file-sheet.controller.js';

const LAYOUT_DELAY = 80;

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

const bindGlobalEvents = () => {
  window.addEventListener('resize', () => emit('layout:refresh'));
};

const init = async () => {
  await storage.init();
  i18n.init(storage.get('language', i18n.getLanguage()));
  initChain.forEach((step) => step());
  i18n.applyTranslations();
  refreshIcons();
  bindGlobalEvents();
  setTimeout(() => emit('layout:refresh'), LAYOUT_DELAY);
  explorer.loadVolumes();
};

export { init };
