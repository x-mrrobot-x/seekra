import { t, translate } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { emptyState } from '../../shared/components/empty-state.js';
import { fileItem } from '../../shared/components/file-item.js';
import { skeletons } from '../../shared/components/skeleton.js';
import { escapeHtml } from '../../shared/utils/format.js';

const STATUS_CLASSES = ['status-running', 'status-ok', 'status-error'];

const templates = {
  chip: (text) =>
    `<li><span class="chip chip-filter">${escapeHtml(text)}<button type="button" class="chip-remove" data-remove-chip>${icon('x', 'icon-xs')}</button></span></li>`,
  empty: () => emptyState({ iconName: 'scan-search', text: t('results.empty'), hint: t('results.emptyHint') }),
  error: ({ text, hint }) => emptyState({ iconName: 'triangle-alert', text, hint }),
};

const setStatus = (elements, className, key, loading = false) => {
  elements.state.classList.remove(...STATUS_CLASSES);
  elements.state.classList.add(className);
  elements.spinner.classList.toggle('hidden', !loading);
  translate(elements.stateText, key);
};

const setCounters = (elements, count, milliseconds) => {
  elements.countValue.textContent = count;
  translate(elements.countLabel, count === 1 ? 'results.one' : 'results.other');
  elements.timeValue.textContent = milliseconds === null ? '—' : `${milliseconds} ms`;
  elements.count.classList.remove('hidden');
  elements.time.classList.remove('hidden');
};

const update = {
  loading: (elements, chips, environment) => {
    elements.progress.classList.add('running');
    setStatus(elements, 'status-running', environment === 'tasker' ? 'results.runningTasker' : 'results.runningWeb', true);
    elements.list.innerHTML = skeletons();
    elements.chips.innerHTML = chips.map(templates.chip).join('');
  },
  summary: (elements, count, milliseconds) => {
    elements.progress.classList.remove('running');
    setCounters(elements, count, milliseconds);
    setStatus(elements, 'status-ok', count ? 'results.done' : 'results.noMatch');
  },
  list: (elements, files) => {
    elements.list.innerHTML = files.length
      ? `<ul class="file-list">${files.map((file, index) => fileItem(file, index, 'results')).join('')}</ul>`
      : templates.empty();
    elements.list.scrollTop = 0;
  },
  error: (elements, content) => {
    elements.progress.classList.remove('running');
    setCounters(elements, 0, null);
    setStatus(elements, 'status-error', 'results.error');
    elements.list.innerHTML = templates.error(content);
  },
};

const helpers = {
  invalidRegex: (message) => ({ text: t('results.regexInvalid', { message }), hint: t('results.regexHint') }),
  failure: (message) => ({ text: t('results.failure', { message }) }),
};

export { templates, update, helpers };
