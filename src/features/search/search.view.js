import { translate, translatePlaceholder } from '../../core/i18n.js';
import { setIcon } from '../../shared/components/icon.js';
import { placeSlider } from '../../shared/utils/dom.js';
import { MODE_ICONS } from './search.config.js';

const update = {
  mode: (elements, mode) => {
    const isAi = mode === 'ai';
    elements.modeButtons.forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
    placeSlider(elements.modeSlider, elements.modeButtons.find((button) => button.dataset.mode === mode));
    elements.input.classList.toggle('monospace', mode === 'regex');
    translatePlaceholder(elements.input, `search.placeholder.${mode}`);
    setIcon(elements.searchIcon, MODE_ICONS[mode]);
    setIcon(elements.searchButtonIcon, isAi ? 'sparkles' : 'search');
    translate(elements.searchButtonLabel, isAi ? 'search.generate' : 'search.search');
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
    elements.statVolumes.textContent = stats.volumes;
    elements.statFree.textContent = stats.free;
    elements.statLastSearch.textContent = stats.lastSearch;
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
    recursive: elements.recursiveChip.classList.contains('active'),
  }),
};

export { update, helpers };
