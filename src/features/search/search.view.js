import { t } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { escapeHtml } from '../../shared/utils/format.js';
import { placeSlider } from '../../shared/utils/dom.js';
import { MODES, MODE_ICONS, TYPE_OPTIONS, SIZE_OPTIONS, PERIOD_OPTIONS, RECENT_SEARCHES } from './search.config.js';

const templates = {
  modeButton: (mode) =>
    `<button data-mode="${mode}">${icon(MODE_ICONS[mode], 'icon-sm')}<span data-i18n="search.mode.${mode}"></span></button>`,

  option: ({ value, key }) => `<option value="${value}" data-i18n="${key}"></option>`,

  recent: ({ text, mode }) =>
    `<span class="chip" data-recent="${escapeHtml(text)}" data-mode="${mode}">${icon(mode === 'regex' ? 'regex' : 'history', 'icon-xs')}${escapeHtml(text)}</span>`,

  stat: ({ value, labelKey }) => `<div class="stat-card"><b>${escapeHtml(value)}</b><span>${t(labelKey)}</span></div>`,

  page: () => `
    <div class="mode-switch" id="mode-switch">
      <div class="mode-switch-slider" id="mode-slider"></div>
      ${MODES.map(templates.modeButton).join('')}
    </div>

    <div id="ai-prompt-slot"></div>

    <div class="search-box">
      <span class="search-icon" id="search-icon"></span>
      <input id="query-input" autocomplete="off">
      <button class="search-button" id="search-button"><span id="search-button-icon"></span><span id="search-button-label"></span></button>
    </div>

    <div class="list-item scope" id="scope-row">
      <div class="item-icon item-icon-dir">${icon('folder-open')}</div>
      <div class="item-meta">
        <div class="scope-label" data-i18n="search.scope.label"></div>
        <div class="item-name" id="scope-name"></div>
        <div class="item-path" id="scope-path"></div>
      </div>
      <span class="icon-button hidden" id="scope-clear">${icon('x', 'icon-sm')}</span>
      ${icon('chevron-right', 'icon-md item-chevron')}
    </div>

    <div class="card filter-card" id="filter-card">
      <h3>${icon('sliders-horizontal', 'icon-xs')}<span data-i18n="search.filters.title"></span></h3>
      <div class="field-grid">
        <div class="field-cell"><label data-i18n="search.filters.type"></label><select id="filter-type">${TYPE_OPTIONS.map(templates.option).join('')}</select></div>
        <div class="field-cell"><label data-i18n="search.filters.size"></label><select id="filter-size">${SIZE_OPTIONS.map(templates.option).join('')}</select></div>
        <div class="field-cell"><label data-i18n="search.filters.period"></label><select id="filter-period">${PERIOD_OPTIONS.map(templates.option).join('')}</select></div>
        <div class="field-cell"><label data-i18n="search.filters.recursive"></label><span class="chip on chip-block" id="recursive-chip">${icon('corner-down-right', 'icon-xs')}<span data-i18n="search.filters.includeSubfolders"></span></span></div>
      </div>
    </div>

    <div id="ai-panel-slot"></div>

    <div id="home-blocks">
      <div class="section-label" data-i18n="search.recents"></div>
      <div class="chips" id="recent-chips">${RECENT_SEARCHES.map(templates.recent).join('')}</div>
      <div class="section-label" data-i18n="search.overview.title"></div>
      <div class="overview-stats" id="overview-stats"></div>
    </div>`,
};

const render = {
  page: (container) => {
    container.innerHTML = templates.page();
  },
};

const update = {
  mode: (elements, mode) => {
    const isAi = mode === 'ai';
    elements.modeButtons.forEach((button) => button.classList.toggle('on', button.dataset.mode === mode));
    placeSlider(elements.modeSlider, elements.modeButtons.find((button) => button.dataset.mode === mode));
    elements.input.classList.toggle('mono', mode === 'regex');
    elements.input.placeholder = t(`search.placeholder.${mode}`);
    elements.searchIcon.innerHTML = icon(MODE_ICONS[mode]);
    elements.searchButtonIcon.innerHTML = icon(isAi ? 'sparkles' : 'search', 'icon-sm');
    elements.searchButtonLabel.textContent = t(isAi ? 'search.generate' : 'search.search');
    elements.filterCard.classList.toggle('hidden', isAi);
    elements.scopeRow.classList.toggle('hidden', isAi);
    elements.homeBlocks.classList.toggle('hidden', isAi);
  },
  scope: (elements, { name, path }, hasScope) => {
    elements.scopeName.textContent = name;
    elements.scopePath.textContent = path;
    elements.scopeClear.classList.toggle('hidden', !hasScope);
  },
  overview: (elements, stats) => {
    elements.overviewStats.innerHTML = stats.map(templates.stat).join('');
  },
  slider: (elements, mode) => {
    placeSlider(elements.modeSlider, elements.modeButtons.find((button) => button.dataset.mode === mode));
  },
  fill: (elements, text) => {
    elements.input.value = text;
    elements.input.focus();
  },
};

const helpers = {
  readFilters: (elements) => ({
    text: elements.input.value.trim(),
    type: elements.filterType.value,
    minSize: elements.filterSize.value,
    days: elements.filterPeriod.value,
    recursive: elements.recursiveChip.classList.contains('on'),
  }),
};

export { templates, render, update, helpers };
