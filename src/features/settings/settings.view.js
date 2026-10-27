import { t, translate } from '../../core/i18n.js';
import { setIcon } from '../../shared/components/icon.js';
import { escapeHtml } from '../../shared/utils/format.js';
import { qs } from '../../shared/utils/dom.js';
import { GEMINI_MODELS } from '../ai/ai.config.js';
import { THEME_COLORS } from './settings.config.js';

const templates = {
  modelOption: ({ id, labelKey }) => `<option value="${id}">${id} — ${t(labelKey)}</option>`,

  root: (volume) => `
    <div class="detail-row">
      <dt>${t(volume.labelKey)}</dt><dd class="status-ok">✓ ${escapeHtml(volume.root)}</dd>
    </div>`,
};

const update = {
  theme: (theme) => {
    document.documentElement.dataset.theme = theme;
    document.getElementById('meta-theme').content = THEME_COLORS[theme];
  },
  fields: (elements, { theme, language, apiKey }) => {
    elements.themeSelect.value = theme;
    elements.languageSelect.value = language;
    elements.apiKey.value = apiKey;
  },
  models: (elements, selected) => {
    elements.modelSelect.innerHTML = GEMINI_MODELS.map(templates.modelOption).join('');
    elements.modelSelect.value = selected;
  },
  keyVisibility: (elements, visible) => {
    elements.apiKey.type = visible ? 'text' : 'password';
    setIcon(elements.keyToggle, visible ? 'eye-off' : 'eye');
  },
  testButton: (elements, loading) => {
    elements.testSpinner.classList.toggle('hidden', !loading);
    qs('[data-icon-slot]', elements.testButton).classList.toggle('hidden', loading);
    translate(elements.testLabel, loading ? 'settings.testing' : 'settings.test');
  },
  message: (elements, type, text = '') => {
    elements.keyOk.classList.toggle('hidden', type !== 'ok');
    elements.keyError.classList.toggle('hidden', type !== 'error');
    if (type === 'ok') elements.keyOkMessage.textContent = text;
    if (type === 'error') elements.keyError.textContent = text;
  },
  roots: (elements, volumes) => {
    elements.rootsList.innerHTML = volumes.map(templates.root).join('');
  },
  environment: (elements, name) => {
    elements.environmentName.textContent = name;
  },
};

export { templates, update };
