import { t, LANGUAGES } from '../../core/i18n.js';
import { icon } from '../../shared/components/icon.js';
import { escapeHtml } from '../../shared/utils/format.js';
import { GEMINI_MODELS } from '../ai/ai.config.js';
import { THEMES, THEME_COLORS } from './settings.config.js';

const templates = {
  themeOption: (theme) => `<option value="${theme}" data-i18n="settings.theme.${theme}"></option>`,
  languageOption: ({ code, label }) => `<option value="${code}">${label}</option>`,
  modelOption: ({ id, labelKey }) => `<option value="${id}">${id} — ${t(labelKey)}</option>`,

  root: (volume, last) => `
    <div class="key-value${last ? ' key-value-last' : ''}">
      <span>${t(volume.labelKey)}</span><span class="status-ok">✓ ${escapeHtml(volume.root)}</span>
    </div>`,

  page: () => `
    <div class="section-label section-label-first" data-i18n="settings.preferences"></div>
    <div class="card">
      <h3>${icon('palette', 'icon-xs')}<span data-i18n="settings.themeTitle"></span></h3>
      <select id="theme-select">${THEMES.map(templates.themeOption).join('')}</select>
    </div>
    <div class="card">
      <h3>${icon('languages', 'icon-xs')}<span data-i18n="settings.languageTitle"></span></h3>
      <select id="language-select">${LANGUAGES.map(templates.languageOption).join('')}</select>
    </div>

    <div class="section-label" data-i18n="settings.aiTitle"></div>
    <div class="card">
      <h3>${icon('key-round', 'icon-xs')}<span data-i18n="settings.apiKey"></span></h3>
      <div class="form-row">
        <div class="key-wrap">
          <input class="field-input mono" type="password" id="api-key" placeholder="AIza…">
          <button class="key-toggle" id="key-toggle"></button>
        </div>
      </div>
      <div class="form-row"><select id="model-select"></select></div>
      <div class="btn-row">
        <button class="btn" id="test-button"></button>
        <button class="btn primary" id="save-button">${icon('save', 'icon-sm')}<span data-i18n="settings.save"></span></button>
      </div>
      <div class="privacy-note">${icon('shield-check', 'icon-sm')}<span data-i18n-html="settings.privacy"></span></div>
      <div class="success-box hidden" id="key-ok">${icon('check', 'icon-sm')}<span id="key-ok-message"></span></div>
      <div class="error-box hidden" id="key-error"></div>
    </div>

    <div class="section-label" data-i18n="settings.storageTitle"></div>
    <div class="card">
      <h3>${icon('hard-drive', 'icon-xs')}<span data-i18n="settings.roots"></span></h3>
      <div id="roots-list"></div>
    </div>

    <div class="section-label" data-i18n="settings.environmentTitle"></div>
    <div class="card">
      <h3>${icon('plug-zap', 'icon-xs')}<span data-i18n="settings.execution"></span></h3>
      <div class="key-value key-value-last"><span data-i18n="settings.activeEnvironment"></span><span id="environment-name"></span></div>
      <div class="btn-row"><button class="btn" id="ping-button">${icon('activity', 'icon-sm')}<span data-i18n="settings.ping"></span></button></div>
    </div>`,
};

const render = {
  page: (container) => {
    container.innerHTML = templates.page();
  },
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
    elements.keyToggle.innerHTML = icon(visible ? 'eye-off' : 'eye', 'icon-sm');
  },
  testButton: (elements, loading) => {
    elements.testButton.innerHTML = loading
      ? `<span class="spinner"></span>${t('settings.testing')}`
      : `${icon('plug-zap', 'icon-sm')}<span>${t('settings.test')}</span>`;
  },
  message: (elements, type, text = '') => {
    elements.keyOk.classList.toggle('hidden', type !== 'ok');
    elements.keyError.classList.toggle('hidden', type !== 'error');
    if (type === 'ok') elements.keyOkMessage.textContent = text;
    if (type === 'error') elements.keyError.textContent = text;
  },
  roots: (elements, volumes) => {
    elements.rootsList.innerHTML = volumes.map((volume, index) => templates.root(volume, index === volumes.length - 1)).join('');
  },
  environment: (elements, name) => {
    elements.environmentName.textContent = name;
  },
};

export { templates, render, update };
