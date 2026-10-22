import { t } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { escapeHtml, formatSize, formatDate } from '../../shared/utils/format.js';
import { CATEGORY_ICONS } from '../../shared/utils/files.js';

const templates = {
  row: (labelKey, value, last = false) =>
    `<div class="key-value${last ? ' key-value-last' : ''}"><span>${t(labelKey)}</span><span>${value}</span></div>`,

  content: (file) => `
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <b>${escapeHtml(file.name)}</b>
      <span class="sheet-close" data-action="close">${icon('x', 'icon-md')}</span>
    </div>
    <div class="preview-box">${icon(CATEGORY_ICONS[file.category], 'icon-lg')}</div>
    ${templates.row('sheet.path', escapeHtml(file.path))}
    ${templates.row('sheet.size', formatSize(file.size))}
    ${templates.row('sheet.modified', formatDate(file.mtime))}
    ${templates.row('sheet.type', t(`category.${file.category}`))}
    <div class="key-value key-value-last">
      <span>${t('sheet.hash')}</span>
      <span class="hash-value" id="hash-value" data-action="hash">${t('sheet.compute')}</span>
    </div>
    <div class="btn-row">
      <button class="btn" data-action="open">${icon('external-link', 'icon-sm')}<span>${t('sheet.open')}</span></button>
      <button class="btn" data-action="share">${icon('share-2', 'icon-sm')}<span>${t('sheet.share')}</span></button>
      <button class="btn" data-action="copy">${icon('copy', 'icon-sm')}<span>${t('sheet.copyPath')}</span></button>
    </div>`,
};

const render = {
  content: (container, file) => {
    container.innerHTML = templates.content(file);
  },
};

const update = {
  hash: (element, state, text = '') => {
    element.classList.toggle('hash-loading', state === 'loading');
    element.classList.toggle('hash-error', state === 'error');
    element.classList.toggle('hash-done', state === 'done');
    element.textContent = state === 'loading' ? t('sheet.computing') : text;
  },
};

const helpers = {
  retryText: (message) => `${message} — ${t('sheet.retry')}`,
};

export { templates, render, update, helpers };
