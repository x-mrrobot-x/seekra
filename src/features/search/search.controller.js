import './search.css';
import { qs, qsa } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { t } from '../../core/i18n.js';
import { navigate } from '../../core/router.js';
import { refreshIcons } from '../../shared/components/icon.js';
import * as model from './search.model.js';
import { render, update, helpers } from './search.view.js';

let elements = null;

const queryElements = () => {
  elements = {
    container: qs('#view-search'),
    modeButtons: qsa('#mode-switch button'),
    modeSlider: qs('#mode-slider'),
    input: qs('#query-input'),
    searchIcon: qs('#search-icon'),
    searchButton: qs('#search-button'),
    searchButtonIcon: qs('#search-button-icon'),
    searchButtonLabel: qs('#search-button-label'),
    scopeRow: qs('#scope-row'),
    scopeName: qs('#scope-name'),
    scopePath: qs('#scope-path'),
    scopeClear: qs('#scope-clear'),
    filterCard: qs('#filter-card'),
    filterType: qs('#filter-type'),
    filterSize: qs('#filter-size'),
    filterPeriod: qs('#filter-period'),
    recursiveChip: qs('#recursive-chip'),
    homeBlocks: qs('#home-blocks'),
    recentChips: qs('#recent-chips'),
    overviewStats: qs('#overview-stats'),
  };
};

const renderMode = () => {
  update.mode(elements, model.getMode());
  refreshIcons();
};

const renderScope = () => update.scope(elements, model.getScopeInfo(), Boolean(model.getScope()));

const renderOverview = () => update.overview(elements, model.getOverviewStats());

const changeMode = (mode) => {
  model.setMode(mode);
  renderMode();
  emit('mode:changed', { mode });
};

const handleSearch = () => {
  const filters = helpers.readFilters(elements);
  if (model.getMode() === 'ai') {
    emit('ai:generate', { prompt: filters.text });
    return;
  }
  if (model.getMode() === 'regex' && filters.text) {
    const problem = model.validateRegex(filters.text);
    if (problem) {
      emit('query:invalid', { message: problem });
      return;
    }
  }
  emit('query:run', model.buildSearch(filters));
};

const handleQuick = ({ text, mode }) => {
  changeMode(mode || model.getMode());
  update.fill(elements, text);
  handleSearch();
};

const handleFill = ({ mode, text }) => {
  if (mode) changeMode(mode);
  update.fill(elements, text);
};

const handleScopeClick = (event) => {
  if (event.target.closest('#scope-clear')) {
    model.clearScope();
    renderScope();
    return;
  }
  emit('scope:pick', { path: model.getScope() });
};

const handleRecentClick = (event) => {
  const chip = event.target.closest('[data-recent]');
  if (chip) handleQuick({ text: chip.dataset.recent, mode: chip.dataset.mode });
};

const setScope = ({ path }) => {
  model.setScope(path);
  renderScope();
  if (model.getMode() === 'ai') changeMode('simple');
  navigate('search', 'search');
  emit('toast', { message: t('search.scope.toast', { path }), icon: 'search' });
};

const handleLanguage = () => {
  renderMode();
  renderScope();
  renderOverview();
};

const bindEvents = () => {
  const bindings = [
    ...elements.modeButtons.map((button) => [button, 'click', () => changeMode(button.dataset.mode)]),
    [elements.searchButton, 'click', handleSearch],
    [elements.input, 'keydown', (event) => event.key === 'Enter' && handleSearch()],
    [elements.scopeRow, 'click', handleScopeClick],
    [elements.recentChips, 'click', handleRecentClick],
    [elements.recursiveChip, 'click', () => elements.recursiveChip.classList.toggle('on')],
  ];
  bindings.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  on('search:quick', handleQuick);
  on('search:fill', handleFill);
  on('scope:set', setScope);
  on('volumes:loaded', () => {
    renderScope();
    renderOverview();
  });
  on('results:rendered', ({ duration }) => {
    model.setLastDuration(duration);
    renderOverview();
  });
  on('language:changed', handleLanguage);
  on('layout:refresh', () => update.slider(elements, model.getMode()));
};

const init = () => {
  render.page(qs('#view-search'));
  queryElements();
  bindEvents();
  renderMode();
  renderScope();
  renderOverview();
};

export { init };
