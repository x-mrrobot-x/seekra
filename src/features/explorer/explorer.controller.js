import { qs, qsa } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { t } from '../../core/i18n.js';
import { navigate } from '../../core/router.js';
import { HIGHLIGHT_DURATION } from './explorer.config.js';
import * as model from './explorer.model.js';
import * as saved from '../saved/saved.model.js';
import { update, helpers } from './explorer.view.js';

let elements = null;
let highlightTimer = null;
let active = false;

const queryElements = () => {
  elements = {
    volumeSwitch: qs('#volume-switch'),
    volumeButtons: qsa('#volume-switch button'),
    slider: qs('#volume-slider'),
    volumeIcon: qs('#volume-icon'),
    volumeName: qs('#volume-name'),
    volumeFree: qs('#volume-free'),
    crumbs: qs('#breadcrumbs'),
    list: qs('#explorer-list'),
    searchHere: qs('#search-here-button'),
    favorite: qs('#favorite-button'),
    favoriteLabel: qs('#favorite-label'),
    backBtn: qs('#parent-folder-button'),
  };
};

const renderFavorite = () => update.favorite(elements, saved.isFavorite(model.getCurrentPath()));

const renderHeader = () => {
  update.header(elements, model.getCurrentVolume(), model.getCrumbs());
  renderFavorite();
  update.volumeButtons(elements, model.getCurrentVolume().key, model.getVolumes());
  update.slider(elements, model.getCurrentVolume().key);
  update.backButton(elements, model.isAtRoot());
};

const renderDirectory = async () => {
  renderHeader();
  update.loading(elements);
  try {
    const loaded = await model.loadDirectory();
    if (!loaded) return;
    update.list(elements, model.getFolders(), model.getFiles());
  } catch (error) {
    update.error(elements, error.message);
  }
};

const restoreVolumes = () => {
  if (!model.restoreVolumes()) return;
  emit('volumes:loaded', { volumes: model.getVolumes() });
  renderHeader();
};

const loadVolumes = async () => {
  try {
    await model.loadVolumes();
    emit('volumes:loaded', { volumes: model.getVolumes() });
    renderHeader();
    if (active) renderDirectory();
  } catch (error) {
    emit('toast', { message: t('settings.volumesFailed', { message: error.message }), icon: 'triangle-alert' });
  }
};

const handleVolumeClick = (event) => {
  const button = event.target.closest('button[data-volume]');
  if (!button) return;
  model.setVolume(button.dataset.volume);
  renderDirectory();
};

const handleCrumbClick = (event) => {
  const crumb = event.target.closest('[data-crumb]');
  if (!crumb) return;
  const index = Number(crumb.dataset.crumb);
  if (index < 0) model.setVolume(model.getCurrentVolume().key);
  else model.navigateTo(index);
  renderDirectory();
};

const handleListClick = (event) => {
  const folder = event.target.closest('[data-folder]');
  if (folder) {
    model.enterFolder(Number(folder.dataset.folder));
    renderDirectory();
    return;
  }
  const item = event.target.closest('[data-source="explorer"]');
  if (item) emit('file:open', { file: model.getFiles()[Number(item.dataset.index)] });
};

const handleSearchHere = () => emit('scope:set', { path: model.getCurrentPath() });

const handleFavorite = () => emit('favorite:toggle', { path: model.getCurrentPath() });

const handleBack = () => {
  model.goBack();
  renderDirectory();
};

const openPath = ({ path }) => {
  if (!model.setPath(path)) {
    emit('toast', { message: t('explorer.unavailable'), icon: 'triangle-alert' });
    return;
  }
  navigate('explorer', 'explorer');
};

const pickScope = ({ path }) => {
  if (path) model.setPath(path);
  navigate('explorer', 'explorer');
  clearTimeout(highlightTimer);
  highlightTimer = helpers.highlight(elements.searchHere, HIGHLIGHT_DURATION);
};

const handleRoute = ({ view }) => {
  active = view === 'explorer';
  if (active) renderDirectory();
};

const handleLanguage = () => {
  renderHeader();
  if (active) renderDirectory();
};

const bindEvents = () => {
  const bindings = [
    [elements.volumeSwitch, 'click', handleVolumeClick],
    [elements.crumbs, 'click', handleCrumbClick],
    [elements.list, 'click', handleListClick],
    [elements.searchHere, 'click', handleSearchHere],
    [elements.favorite, 'click', handleFavorite],
    [elements.backBtn, 'click', handleBack],
  ];
  bindings.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  on('route:changed', handleRoute);
  on('explorer:open', openPath);
  on('scope:pick', pickScope);
  on('language:changed', handleLanguage);
  on('favorites:changed', renderFavorite);
  on('storage:ready', renderFavorite);
  on('layout:refresh', () => update.slider(elements, model.getCurrentVolume().key));
};

const init = () => {
  queryElements();
  bindEvents();
  renderHeader();
};

export { init, restoreVolumes, loadVolumes };
