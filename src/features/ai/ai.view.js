import { t, translate } from '../../core/i18n.js';
import { icon, setIcon } from '../../shared/components/icon.js';
import { escapeHtml } from '../../shared/utils/format.js';

const templates = {
  chip: (text) => `<li><span class="chip chip-filter">${escapeHtml(text)}</span></li>`,

  validated: (key) => `<li><span class="chip chip-success">${icon('shield-check', 'icon-xs')}${t(key)}</span></li>`,
};

const update = {
  state: (elements, state) => {
    const isLoading = state === 'loading';
    elements.panel.classList.toggle('hidden', state === 'hidden');
    elements.body.classList.toggle('hidden', state !== 'result');
    elements.loading.classList.toggle('hidden', !isLoading);
    elements.error.classList.toggle('hidden', state !== 'error');
    setIcon(elements.title, isLoading ? 'loader-circle' : 'terminal');
    translate(elements.titleText, isLoading ? 'ai.panel.generating' : 'ai.panel.title');
  },
  result: (elements, { command, explanation, chips }, validatedKey) => {
    elements.command.textContent = command;
    elements.explain.textContent = explanation;
    elements.chips.innerHTML = chips.map(templates.chip).join('') + templates.validated(validatedKey);
  },
  error: (elements, { message, hint = '' }, withDemo) => {
    elements.errorMessage.innerHTML = message;
    elements.errorHint.innerHTML = hint;
    elements.errorHintGroup.classList.toggle('hidden', !hint);
    elements.errorDemoGroup.classList.toggle('hidden', !withDemo);
  },
  promptZone: (elements, visible) => {
    elements.promptZone.classList.toggle('hidden', !visible);
  },
};

// Mensagens dos locales carregam marcação inline (<strong>); só os parâmetros dinâmicos são escapados.
const helpers = {
  noKey: () => ({ message: t('ai.errors.noKey'), hint: t('ai.errors.noKeyHint') }),
  rejected: (reason) => ({
    message: t('ai.errors.rejected', { reason: t(reason) }),
    hint: t('ai.errors.rejectedHint'),
  }),
  failed: (message) => ({
    message: t('ai.errors.failed', { message: escapeHtml(message) }),
    hint: t('ai.errors.failedHint'),
  }),
  notUnderstood: () => ({ message: t('ai.errors.notUnderstood') }),
  localRejected: (reason) => ({ message: t('ai.errors.localRejected', { reason: t(reason) }) }),
};

export { templates, update, helpers };
