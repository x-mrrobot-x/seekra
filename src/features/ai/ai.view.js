import { t } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { escapeHtml } from '../../shared/utils/format.js';
import { EXAMPLES } from './ai.config.js';

const templates = {
  example: ({ labelKey, promptKey }) =>
    `<span class="chip" data-prompt-key="${promptKey}" data-i18n="${labelKey}"></span>`,

  promptZone: () => `
    <div class="prompt-zone hidden" id="prompt-zone">
      <div class="prompt-card">
        <h2>${icon('wand-sparkles', 'icon-md')}<span data-i18n="ai.prompt.title"></span></h2>
        <p data-i18n-html="ai.prompt.description"></p>
        <div class="prompt-examples">${EXAMPLES.map(templates.example).join('')}</div>
      </div>
    </div>`,

  panel: () => `
    <div class="card hidden" id="ai-panel">
      <h3 id="ai-title"></h3>
      <div id="ai-body">
        <div class="command-box" id="ai-command"></div>
        <div class="command-explain" id="ai-explain"></div>
        <div class="chips" id="ai-chips"></div>
        <div class="btn-row">
          <button class="btn" id="ai-edit">${icon('pencil', 'icon-sm')}<span data-i18n="ai.panel.edit"></span></button>
          <button class="btn" id="ai-copy">${icon('copy', 'icon-sm')}<span data-i18n="ai.panel.copy"></span></button>
          <button class="btn primary" id="ai-run">${icon('play', 'icon-sm')}<span data-i18n="ai.panel.run"></span></button>
        </div>
      </div>
      <div class="ai-loading hidden" id="ai-loading">
        <div class="loading-orbit"></div>
        <div><b data-i18n="ai.loading.title"></b><br><span data-i18n="ai.loading.subtitle"></span></div>
      </div>
      <div class="error-box hidden" id="ai-error"></div>
    </div>`,

  chip: (text) => `<span class="chip chip-filter">${escapeHtml(text)}</span>`,

  validated: (key) => `<span class="chip chip-ok">${icon('shield-check', 'icon-xs')}${t(key)}</span>`,

  demoButton: () => `<br><br><span class="chip" id="ai-demo">${icon('cpu', 'icon-xs')}${t('ai.errors.useLocal')}</span>`,
};

const render = {
  slots: (promptSlot, panelSlot) => {
    promptSlot.innerHTML = templates.promptZone();
    panelSlot.innerHTML = templates.panel();
  },
};

const update = {
  state: (elements, state) => {
    const isLoading = state === 'loading';
    elements.panel.classList.toggle('hidden', state === 'hidden');
    elements.body.classList.toggle('hidden', state !== 'result');
    elements.loading.classList.toggle('hidden', !isLoading);
    elements.error.classList.toggle('hidden', state !== 'error');
    elements.title.innerHTML = `${icon(isLoading ? 'loader-circle' : 'terminal', 'icon-xs')}${t(isLoading ? 'ai.panel.generating' : 'ai.panel.title')}`;
  },
  result: (elements, { command, explanation, chips }, validatedKey) => {
    elements.command.textContent = command;
    elements.explain.textContent = explanation;
    elements.chips.innerHTML = chips.map(templates.chip).join('') + templates.validated(validatedKey);
  },
  error: (elements, html, withDemo) => {
    elements.error.innerHTML = html + (withDemo ? templates.demoButton() : '');
  },
  promptZone: (elements, visible) => {
    elements.promptZone.classList.toggle('hidden', !visible);
  },
};

const helpers = {
  noKeyHtml: () => `${t('ai.errors.noKey')}<br><small>${t('ai.errors.noKeyHint')}</small>`,
  rejectedHtml: (reason) => `${t('ai.errors.rejected', { reason: t(reason) })}<br><small>${t('ai.errors.rejectedHint')}</small>`,
  failedHtml: (message) => `${t('ai.errors.failed', { message: escapeHtml(message) })}<br><small>${t('ai.errors.failedHint')}</small>`,
  notUnderstoodHtml: () => t('ai.errors.notUnderstood'),
  localRejectedHtml: (reason) => t('ai.errors.localRejected', { reason: t(reason) }),
};

export { templates, render, update, helpers };
