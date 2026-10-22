import './results.css';
import { qs } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { navigate } from '../../core/router.js';
import { name as environmentName } from '@env';
import { refreshIcons } from '../../shared/components/icon.js';
import * as model from './results.model.js';
import { render, update, helpers } from './results.view.js';

let elements = null;
let lastDuration = null;
let hasResults = false;

const queryElements = () => {
  elements = {
    backLink: qs('#back-link'),
    count: qs('#results-count'),
    time: qs('#results-time'),
    state: qs('#results-state'),
    progress: qs('#progress'),
    chips: qs('#results-chips'),
    list: qs('#results-list'),
  };
};

const showResults = (files, duration) => {
  hasResults = true;
  lastDuration = duration;
  update.summary(elements, files.length, duration);
  update.list(elements, files);
  refreshIcons();
  emit('results:rendered', { count: files.length, duration });
};

const showError = (html) => {
  hasResults = false;
  update.error(elements, html);
  refreshIcons();
};

const handleRun = async (query) => {
  navigate('results', 'search');
  update.loading(elements, query.chips, environmentName);
  refreshIcons();
  try {
    const outcome = await model.run(query);
    if (outcome) showResults(outcome.files, outcome.duration);
  } catch (error) {
    showError(helpers.failureHtml(error.message));
  }
};

const handleInvalid = ({ message }) => {
  navigate('results', 'search');
  showError(helpers.invalidRegexHtml(message));
};

const handleListClick = (event) => {
  const item = event.target.closest('[data-source="results"]');
  if (item) emit('file:open', { file: model.getFiles()[Number(item.dataset.index)] });
};

const handleChipClick = (event) => {
  const remove = event.target.closest('[data-remove-chip]');
  if (remove) remove.parentElement.remove();
};

const handleLanguage = () => {
  if (!hasResults) return;
  update.summary(elements, model.getFiles().length, lastDuration);
  update.list(elements, model.getFiles());
  refreshIcons();
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
  render.page(qs('#view-results'));
  queryElements();
  bindEvents();
};

export { init };
