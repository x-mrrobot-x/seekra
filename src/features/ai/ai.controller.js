import './ai.css';
import { qs } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { t } from '../../core/i18n.js';
import { refreshIcons } from '../../shared/components/icon.js';
import * as model from './ai.model.js';
import { render, update, helpers } from './ai.view.js';

let elements = null;
let state = 'hidden';
let lastPrompt = '';

const queryElements = () => {
  elements = {
    promptZone: qs('#prompt-zone'),
    panel: qs('#ai-panel'),
    title: qs('#ai-title'),
    body: qs('#ai-body'),
    command: qs('#ai-command'),
    explain: qs('#ai-explain'),
    chips: qs('#ai-chips'),
    edit: qs('#ai-edit'),
    copy: qs('#ai-copy'),
    run: qs('#ai-run'),
    loading: qs('#ai-loading'),
    error: qs('#ai-error'),
  };
};

const setState = (value) => {
  state = value;
  update.state(elements, value);
  refreshIcons();
};

const showError = (html, withDemo) => {
  update.error(elements, html, withDemo);
  setState('error');
};

const showResult = (result, validatedKey) => {
  update.result(elements, result, validatedKey);
  setState('result');
};

const generate = async ({ prompt }) => {
  if (!prompt) {
    emit('toast', { message: t('ai.describeFirst'), icon: 'info' });
    return;
  }
  lastPrompt = prompt;
  if (!model.hasApiKey()) {
    showError(helpers.noKeyHtml(), true);
    return;
  }
  setState('loading');
  elements.panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try {
    const result = await model.generateCommand(prompt);
    const reason = model.validateCommand(result.command);
    if (reason) showError(helpers.rejectedHtml(reason), true);
    else showResult(result, 'ai.validated');
  } catch (error) {
    showError(helpers.failedHtml(error.message), true);
  }
};

const interpretLocally = () => {
  const result = model.interpretLocally(lastPrompt);
  if (!result) {
    showError(helpers.notUnderstoodHtml(), false);
    return;
  }
  const reason = model.validateCommand(result.command);
  if (reason) showError(helpers.localRejectedHtml(reason), false);
  else showResult({ ...result, explanation: `${result.explanation} ${t('ai.local.suffix')}` }, 'ai.validatedLocal');
};

const handleExampleClick = (event) => {
  const chip = event.target.closest('[data-prompt-key]');
  if (chip) emit('search:fill', { mode: 'ai', text: t(chip.dataset.promptKey) });
};

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(elements.command.textContent);
    emit('toast', { message: t('ai.copied'), icon: 'copy' });
  } catch {
    emit('toast', { message: t('ai.copyFailed'), icon: 'alert-triangle' });
  }
};

const handleEdit = () => {
  emit('search:fill', { mode: 'regex', text: elements.command.textContent });
  emit('toast', { message: t('ai.editing'), icon: 'pencil' });
};

const handleRun = () =>
  emit('query:run', { type: 'ia', command: elements.command.textContent.trim(), chips: [t('chips.ai')] });

const handleErrorClick = (event) => {
  if (event.target.closest('#ai-demo')) interpretLocally();
};

const handleMode = ({ mode }) => {
  update.promptZone(elements, mode === 'ai');
  if (mode !== 'ai') setState('hidden');
};

const bindEvents = () => {
  const bindings = [
    [elements.promptZone, 'click', handleExampleClick],
    [elements.copy, 'click', handleCopy],
    [elements.edit, 'click', handleEdit],
    [elements.run, 'click', handleRun],
    [elements.error, 'click', handleErrorClick],
  ];
  bindings.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  on('ai:generate', generate);
  on('mode:changed', handleMode);
  on('language:changed', () => setState(state));
};

const init = () => {
  render.slots(qs('#ai-prompt-slot'), qs('#ai-panel-slot'));
  queryElements();
  bindEvents();
  update.state(elements, 'hidden');
};

export { init };
