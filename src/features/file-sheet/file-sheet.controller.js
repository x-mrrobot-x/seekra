import { qs } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { t } from '../../core/i18n.js';
import * as modalManager from '../../core/modal-manager.js';
import * as model from './file-sheet.model.js';
import { update, helpers } from './file-sheet.view.js';

const MODAL_NAME = 'file-sheet';

let elements = null;

const queryElements = () => {
  elements = {
    sheet: qs('#file-sheet'),
    name: qs('#sheet-name'),
    preview: qs('#sheet-preview'),
    path: qs('#sheet-path'),
    size: qs('#sheet-size'),
    modified: qs('#sheet-modified'),
    type: qs('#sheet-type'),
    hash: qs('#sheet-hash'),
  };
};

const openSheet = ({ file }) => {
  model.setFile(file);
  update.file(elements, file);
  update.hash(elements.hash, 'idle');
  modalManager.open(MODAL_NAME);
};

const computeHash = async () => {
  update.hash(elements.hash, 'loading');
  try {
    update.hash(elements.hash, 'done', await model.computeHash());
  } catch (error) {
    update.hash(elements.hash, 'error', helpers.retryText(error.message));
  }
};

const runFileAction = async (action) => {
  const actions = { open: [model.openFile, 'sheet.opening', 'external-link'], share: [model.shareFile, 'sheet.sharing', 'share-2'] };
  const [run, messageKey, iconName] = actions[action];
  try {
    await run();
    emit('toast', { message: t(messageKey), icon: iconName });
  } catch (error) {
    emit('toast', { message: error.message, icon: 'triangle-alert' });
  }
};

const copyPath = async () => {
  try {
    await navigator.clipboard.writeText(model.getFile().path);
    emit('toast', { message: t('sheet.copied'), icon: 'copy' });
  } catch {
    emit('toast', { message: t('ai.copyFailed'), icon: 'triangle-alert' });
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
