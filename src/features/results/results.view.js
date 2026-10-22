import { t } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { emptyState } from '../../shared/components/empty-state.js';
import { fileItem } from '../../shared/components/file-item.js';
import { skeletons } from '../../shared/components/skeleton.js';
import { escapeHtml } from '../../shared/utils/format.js';

const templates = {
  page: () => `
    <span class="back-link" id="back-link">${icon('arrow-left', 'icon-xs')}<span data-i18n="results.back"></span></span>
    <div class="results-status">
      <span id="results-count"></span>
      <span id="results-time"></span>
      <span id="results-state"></span>
    </div>
    <div class="progress" id="progress"><i></i></div>
    <div class="chips results-chips" id="results-chips"></div>
    <div class="file-list scroll-list" id="results-list"></div>`,

  chip: (text) =>
    `<span class="chip chip-filter">${escapeHtml(text)}<b data-remove-chip>${icon('x', 'icon-xs')}</b></span>`,

  count: (count) => `<b>${count}</b> ${t(count === 1 ? 'results.one' : 'results.other')}`,

  time: (milliseconds) => `${icon('timer', 'icon-xs')} ${milliseconds === null ? '—' : `${milliseconds} ms`}`,

  state: (key, className) => `<span class="${className}">${t(key)}</span>`,

  running: (environment) =>
    `<span class="status-running"><span class="spinner"></span> ${t(environment === 'tasker' ? 'results.runningTasker' : 'results.runningWeb')}</span>`,

  empty: () => emptyState({ iconName: 'scan-search', text: t('results.empty'), hint: t('results.emptyHint') }),
  error: (html) => emptyState({ iconName: 'alert-triangle', text: html }),
};

const render = {
  page: (container) => {
    container.innerHTML = templates.page();
  },
};

const update = {
  loading: (elements, chips, environment) => {
    elements.progress.classList.add('run');
    elements.state.innerHTML = templates.running(environment);
    elements.list.innerHTML = skeletons();
    elements.chips.innerHTML = chips.map(templates.chip).join('');
  },
  summary: (elements, count, milliseconds) => {
    elements.progress.classList.remove('run');
    elements.count.innerHTML = templates.count(count);
    elements.time.innerHTML = templates.time(milliseconds);
    elements.state.innerHTML = templates.state(count ? 'results.done' : 'results.noMatch', 'status-ok');
  },
  list: (elements, files) => {
    elements.list.innerHTML = files.length
      ? files.map((file, index) => fileItem(file, index, 'results')).join('')
      : templates.empty();
    elements.list.scrollTop = 0;
  },
  error: (elements, html) => {
    elements.progress.classList.remove('run');
    elements.count.innerHTML = templates.count(0);
    elements.time.innerHTML = templates.time(null);
    elements.state.innerHTML = templates.state('results.error', 'status-error');
    elements.list.innerHTML = templates.error(html);
  },
};

const helpers = {
  invalidRegexHtml: (message) =>
    `${t('results.regexInvalid', { message: escapeHtml(message) })}<br><small>${t('results.regexHint')}</small>`,
  failureHtml: (message) => t('results.failure', { message: escapeHtml(message) }),
};

export { templates, render, update, helpers };
