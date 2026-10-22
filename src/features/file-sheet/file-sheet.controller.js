import './file-sheet.css';
import { qs } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { t } from '../../core/i18n.js';
import * as modalManager from '../../core/modal-manager.js';
import { refreshIcons } from '../../shared/components/icon.js';
import * as model from './file-sheet.model.js';
import { render, update, helpers } from './file-sheet.view.js';

const MODAL_NAME = 'file-sheet';

let elements = null;

const queryElements = () => {
  elements = { sheet: qs('#sheet') };
};

const openSheet = ({ file }) => {
  model.setFile(file);
  render.content(elements.sheet, file);
  refreshIcons();
  modalManager.open(MODAL_NAME);
};

const computeHash = async () => {
  const element = qs('#hash-value', elements.sheet);
  update.hash(element, 'loading');
  try {
    update.hash(element, 'done', await model.computeHash());
  } catch (error) {
    update.hash(element, 'error', helpers.retryText(error.message));
  }
};

const runFileAction = async (action) => {
  const actions = { open: [model.openFile, 'sheet.opening', 'external-link'], share: [model.shareFile, 'sheet.sharing', 'share-2'] };
  const [run, messageKey, iconName] = actions[action];
  try {
    await run();
    emit('toast', { message: t(messageKey), icon: iconName });
  } catch (error) {
    emit('toast', { message: error.message, icon: 'alert-triangle' });
  }
};

const copyPath = async () => {
  try {
    await navigator.clipboard.writeText(model.getFile().path);
    emit('toast', { message: t('sheet.copied'), icon: 'copy' });
  } catch {
    emit('toast', { message: t('ai.copyFailed'), icon: 'alert-triangle' });
  }
};

const handleSheetClick = (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action } = target.dataset;
  if (action === 'close') modalManager.close();
  else if (action === 'hash') computeHash();
  else if (action === 'copy') copyPath();
  else runFileAction(action);
};

const bindEvents = () => {
  [[elements.sheet, 'click', handleSheetClick]].forEach(([element, event, handler]) =>
    element.addEventListener(event, handler),
  );
  on('file:open', openSheet);
};

const init = () => {
  queryElements();
  modalManager.register(MODAL_NAME, { element: elements.sheet });
  bindEvents();
};

export { init };
