import { qs } from '../../shared/utils/dom.js';
import { emit, on } from '../../core/event-bus.js';
import { t } from '../../core/i18n.js';
import * as model from './settings.model.js';
import { update } from './settings.view.js';

let elements = null;
let keyVisible = false;

const queryElements = () => {
  elements = {
    themeSelect: qs('#theme-select'),
    languageSelect: qs('#language-select'),
    apiKey: qs('#api-key'),
    keyToggle: qs('#toggle-key-button'),
    modelSelect: qs('#model-select'),
    testButton: qs('#test-key-button'),
    testSpinner: qs('#test-spinner'),
    testLabel: qs('#test-label'),
    saveButton: qs('#save-key-button'),
    keyOk: qs('#api-key-success'),
    keyOkMessage: qs('#api-key-success-message'),
    keyError: qs('#api-key-error'),
    rootsList: qs('#roots-list'),
    environmentName: qs('#environment-name'),
    pingButton: qs('#ping-button'),
  };
};

const renderDynamic = () => {
  update.models(elements, model.getModelId());
  update.roots(elements, model.getRoots());
  update.testButton(elements, false);
  update.keyVisibility(elements, keyVisible);
};

const handleTheme = () => {
  model.setTheme(elements.themeSelect.value);
  update.theme(elements.themeSelect.value);
};

const handleLanguage = () => model.changeLanguage(elements.languageSelect.value);

const handleToggleKey = () => {
  keyVisible = !keyVisible;
  update.keyVisibility(elements, keyVisible);
};

const handleSave = () => {
  const apiKey = elements.apiKey.value.trim();
  const selected = elements.modelSelect.value;
  model.saveGemini({ apiKey, model: selected });
  update.message(elements, 'ok', t('settings.saved', { model: selected }));
  emit('toast', { message: t('settings.keySaved'), icon: 'key-round' });
};

const handleTest = async () => {
  if (!model.getApiKey()) {
    update.message(elements, 'error', t('settings.noKey'));
    return;
  }
  update.testButton(elements, true);
  try {
    await model.testGemini();
    update.message(elements, 'ok', t('settings.testOk', { model: model.getModelId() }));
    emit('toast', { message: t('settings.testToast'), icon: 'plug-zap' });
  } catch (error) {
    update.message(elements, 'error', t('settings.testFailed', { message: error.message }));
  }
  update.testButton(elements, false);
};

const handlePing = async () => {
  try {
    const milliseconds = await model.pingEnvironment();
    emit('toast', { message: t('settings.pingOk', { env: model.getEnvironmentName(), ms: milliseconds }), icon: 'plug-zap' });
  } catch (error) {
    emit('toast', { message: t('settings.pingFailed', { message: error.message }), icon: 'triangle-alert' });
  }
};

const bindEvents = () => {
  const bindings = [
    [elements.themeSelect, 'change', handleTheme],
    [elements.languageSelect, 'change', handleLanguage],
    [elements.keyToggle, 'click', handleToggleKey],
    [elements.saveButton, 'click', handleSave],
    [elements.testButton, 'click', handleTest],
    [elements.pingButton, 'click', handlePing],
  ];
  bindings.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  on('volumes:loaded', () => update.roots(elements, model.getRoots()));
  on('language:changed', renderDynamic);
};

const renderStored = () => {
  update.theme(model.getTheme());
  update.fields(elements, { theme: model.getTheme(), language: model.getLanguage(), apiKey: model.getApiKey() });
  update.models(elements, model.getModelId());
};

const init = () => {
  queryElements();
  bindEvents();
  renderStored();
  update.environment(elements, model.getEnvironmentName());
  renderDynamic();
  on('storage:ready', renderStored);
};

export { init };
