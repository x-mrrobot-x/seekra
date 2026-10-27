import { qs } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { navigate } from '../../core/router.js';
import { name as environmentName } from '@env';
import * as model from './results.model.js';
import { update, helpers } from './results.view.js';

let elements = null;
let lastDuration = null;
let hasResults = false;

const queryElements = () => {
  elements = {
    backLink: qs('#new-search-button'),
    count: qs('#results-count'),
    countValue: qs('#results-count-value'),
    countLabel: qs('#results-count-label'),
    time: qs('#results-time'),
    timeValue: qs('#results-time-value'),
    state: qs('#results-state'),
    spinner: qs('#results-spinner'),
    stateText: qs('#results-state-text'),
    progress: qs('#results-progress'),
    chips: qs('#results-chips'),
    list: qs('#results-list'),
  };
};

const showResults = (files, duration) => {
  hasResults = true;
  lastDuration = duration;
  update.summary(elements, files.length, duration);
  update.list(elements, files);
  emit('results:rendered', { count: files.length, duration });
};

const showError = (content) => {
  hasResults = false;
  update.error(elements, content);
};

const handleRun = async (query) => {
  navigate('results', 'search');
  update.loading(elements, query.chips, environmentName);
  try {
    const outcome = await model.run(query);
    if (outcome) showResults(outcome.files, outcome.duration);
  } catch (error) {
    showError(helpers.failure(error.message));
  }
};

const handleInvalid = ({ message }) => {
  navigate('results', 'search');
  showError(helpers.invalidRegex(message));
};

const handleListClick = (event) => {
  const item = event.target.closest('[data-source="results"]');
  if (item) emit('file:open', { file: model.getFiles()[Number(item.dataset.index)] });
};

const handleChipClick = (event) => {
  const remove = event.target.closest('[data-remove-chip]');
  if (remove) remove.closest('li').remove();
};

const handleLanguage = () => {
  if (!hasResults) return;
  update.summary(elements, model.getFiles().length, lastDuration);
  update.list(elements, model.getFiles());
};

const bindEvents = () => {
  const bindings = [
    [elements.backLink, 'click', () => navigate('search', 'search')],
    [elements.list, 'click', handleListClick],
    [elements.chips, 'click', handleChipClick],
  ];
  bindings.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  on('query:run', handleRun);
  on('query:invalid', handleInvalid);
  on('language:changed', handleLanguage);
};

const init = () => {
  queryElements();
  bindEvents();
};

export { init };
