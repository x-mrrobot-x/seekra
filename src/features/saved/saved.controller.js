import { qs } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { t } from '../../core/i18n.js';
import * as model from './saved.model.js';
import { update } from './saved.view.js';

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
  const folders = model.getFolders();
  const remove = event.target.closest('[data-unfavorite]');
  if (remove) {
    emit('favorite:toggle', { path: folders[Number(remove.dataset.unfavorite)].path });
    return;
  }
  const item = event.target.closest('[data-folder]');
  if (item) emit('explorer:open', { path: folders[Number(item.dataset.folder)].path });
};

const refresh = () => {
  update.lists(elements, model.getQueries(), model.getFolders());
};

// Único ponto que altera os favoritos: Explorer e esta página só pedem 'favorite:toggle'.
const handleToggle = ({ path }) => {
  const added = model.toggleFavorite(path);
  refresh();
  emit('favorites:changed', { path, added });
  emit('toast', { message: t(added ? 'explorer.favoriteAdded' : 'explorer.favoriteRemoved'), icon: 'star' });
};

const bindEvents = () => {
  const bindings = [
    [elements.queries, 'click', handleQueryClick],
    [elements.folders, 'click', handleFolderClick],
  ];
  bindings.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  on('favorite:toggle', handleToggle);
  on('language:changed', refresh);
  on('storage:ready', refresh);
};

const init = () => {
  queryElements();
  bindEvents();
  refresh();
};

export { init };
