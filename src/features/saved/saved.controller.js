import { qs } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { refreshIcons } from '../../shared/components/icon.js';
import * as model from './saved.model.js';
import { render, update } from './saved.view.js';

let elements = null;

const queryElements = () => {
  elements = { queries: qs('#saved-queries'), folders: qs('#saved-folders') };
};

const handleQueryClick = (event) => {
  const item = event.target.closest('[data-query]');
  if (!item) return;
  const { text, mode } = model.getQueries()[Number(item.dataset.query)];
  emit('search:quick', { text, mode });
};

const handleFolderClick = (event) => {
  const item = event.target.closest('[data-folder]');
  if (item) emit('explorer:open', { path: model.getFolders()[Number(item.dataset.folder)].path });
};

const refresh = () => {
  update.lists(elements, model.getQueries(), model.getFolders());
  refreshIcons();
};

const bindEvents = () => {
  const bindings = [
    [elements.queries, 'click', handleQueryClick],
    [elements.folders, 'click', handleFolderClick],
  ];
  bindings.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  on('language:changed', refresh);
};

const init = () => {
  render.page(qs('#view-saved'), model.getQueries(), model.getFolders());
  queryElements();
  bindEvents();
};

export { init };
